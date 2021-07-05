//Prometo modular ;-(
const express = require("express");
const path = require("path");
const app = express();
const userRegister = require("./db/users/mdb-insertone");
const publish = require("./db/publish/mdb-insertone");
const showPublictn = require("./db/publish/ver-datos");
const isTaken = require("./db/users/mdb-findone");
const getPublication = require("./db/publish/mdb-find");
const verDatos = require("./ver-datos");
const expHbs = require("express-handlebars");
const mongodb = require("mongodb");
const dbConfig = require("./db/users/dbConfig");
const expSession = require("express-session");

/**/
app.use(
  expSession({
    secret: ["esto me esta costando una banda"],
    resave: false,
    saveUninitialized: false,
    path: '/',
  })
);

/*** Configuración de Handlebars para Express ***/
app.engine(
  "handlebars",
  expHbs({
    defaultLayout: "main-layout",
    layoutsDir: "views/layouts",
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
/************************************************/

const PUERTO = 3000;
app.use(express.json());
// Middleware para poner el contenido de un form post en req.body
app.use(express.urlencoded({ extended: false }));

// Middleware para archivos de imagen, css, scripts, etc ("recursos estáticos")
app.use(express.static(path.join(__dirname, "/client/")));

//Aquí se usa un middleware para controlar el acceso a ciertas secciones segun si el user esta logueado
const auth = function(req, res, next) {
  if (req.session && req.session.user)
    return next();
  else
    return res.redirect("/");
};
// GET inicial, envia hacia el registro por ahora
//mi idea es hacer una vista más con botones hacia login o register
app.get("/", (req, res) => {
  res.render("login", { layout: "empty-layout" });
});
//Una vez logueado se puede ver el feed de publicaciones (faltan estilos)
app.get("/home",auth, (req, res) =>{

  let mainTitle;
  let result;

  getPublication.getAllPublications(
    (err) => {
      console.log(err);
      res.render("error", {
        mensajeError: err,
      });
    },

    (allPublictn) => {
      if (allPublictn.length > 0) {
        result = `Hay ${allPublictn.length} resultado${allPublictn.length === 1 ? "" : "s"
          } para tu consulta:`;
      }
      else {
        result = "No hay resultados para tu consulta";
      }

      mainTitle = "Feed";

      // Renderizo la vista "feed" con esos datos
      res.render("feed", {
        username: req.session.user.user,
        publications: allPublictn,
        //tituloResultados: result,
        title: mainTitle,
      });
    }
  );

});
//++++++++++++++ PUBLICAR  ++++++++++++++++++++++

app.get("/add", auth, (req, res) => {
  
  let title = " crear publicacion";
  res.render("newPublictn", { username: req.session.user.user , title })
});
app.post("/newPublictn", (req, res) => {
  const date = Date.now();
  const actualTime = new Date(date);
  let content = req.body.publication;
  let data = {
    date:actualTime.toDateString(),
    author:req.session.user,
    contenido: content,
  };
  console.log(content);
  publish(data, verDatos.error, (result) => {
    //console.log(result);
  });
  res.redirect("/home");
})
//+++++++++++++++++ LOGIN +++++++++++++++++++++++++++++++++
app.get("/login", (req, res) => {
  res.render("login", { layout: "empty-layout" });
});
// POST a /login, verifica que user y password sean de un usuario registrado, en ese caso
//  redirecciona al feed, sino mensaje de error en la misma vista de logueo
app.post("/loginUsr", (req, res) => {
  const { user, pwd } = req.body;
  let error = [];
  //en la vista de logueo no debería enviar nada sin poner ambos datos, pero por precaución lo dejé
  if (!user || !pwd) {
    error.push("No ha ingresado todos los datos");
    res.render("login", { error, user, pwd, layout: "empty-layout" });
  }
  else {
    isTaken.searchByUsernameAndPass(user, pwd, (errorMsg) => {
      
      res.render("login", { error: errorMsg, user, layout: "empty-layout" });
    }, (userData) => {
      console.log(userData);
      if (userData) {
        req.session.user = userData;
        res.redirect("/home");        
      }
      else{
        error.push("usuario y/o contraseña incorrectos");
        res.render("login", { error, user, layout: "empty-layout" });
      }
    })
  }
});

//+++++++++++++ Me gustaria que confirme si realmente quiere salir, queda pendiente ++++++++++++++++
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});
//++++++++++++++ REGISTER ++++++++++++++++++++++++++++
app.post("/registerUsr", async (req, res) => {
  let errors = [];
  const { user, pwd, pwdRep } = req.body;
  let data = {
    user: user,
    pwd: pwd,
  };
  //por el required del for no entraria al primer if, pero lo dejé hasta consultar
  if (!user || !pwd || !pwdRep) {

    errors.push("Deben completarse los tres campos");
    res.render("register", { errors, user, layout: "empty-layout" });
  }
  else if (pwd !== pwdRep) {

    errors.push("La clave y su repetición no son iguales");
    res.render("register", { errors, user, layout: "empty-layout" });
  }
  else {
    mongodb.MongoClient.connect(dbConfig.url, async function (err, client) {

      if (err) {
        console.log("Hubo un error conectando con el servidor:", err);
        return;
      }
      const job_board = client.db(dbConfig.db);
      const colUsers = job_board.collection(dbConfig.coleccion);
      let result = await colUsers.find({ user: user.toString() }).limit(1).toArray();
      client.close();
      console.log(result);
      if (result.length > 0) {
        console.log("este usuario ya existe");

        errors.push("Este usuario ya está registrado");

        res.render("register", { errors, user, pwd, pwdRep, layout: "empty-layout" });
      }
      else {
        userRegister(data, verDatos.error, (resultado) => {
          console.log(resultado);
          // consultarProductos(verDatos.error, verDatos.listaProductos);
        });
        res.redirect("/home");
      }
    });
  }

});
app.post("/search", auth, (req, res)=>{
  let mainTitle;
  let result;
  const filterWord = req.body.filterWord;
  getPublication.filterByWord(filterWord,
    (err) => {
      console.log(err);
      res.render("error", {
        mensajeError: err,
      });
    },

    (filterPublication) => {
      if (filterPublication.length > 0) {
        result = `Hay ${filterPublication.length} resultado${filterPublication.length === 1 ? "" : "s"
          } para tu consulta:`;
      }
      else {
        result = "No hay resultados para tu consulta";
      }

      mainTitle = "Feed";

      // Renderizo la vista "feed" con esos datos
      res.render("feed", {
        username: req.session.user.user,
        publications: filterPublication,
        //tituloResultados: result,
        title: mainTitle,
      });
    }
  );
})
//Este endpoint redirecciona siempre a "login" cuando se trata de ingresar a una ruta no autorizada o inexistente
app.get('*',function (req, res) {
  res.redirect('/');
});
// Inicio server
app.listen(PUERTO, function () {
  console.log(`Servidor iniciado en puerto ${PUERTO}...`);
});
