//Prometo modular ;-(
const express = require("express");
const path = require("path");
const app = express();
const userRegister = require("./db/users/mdb-insertone");
const createPublication = require("./db/publish/mdb-insertone");
const getAllPublications = require("./db/publish/ver-datos");
const searchUser = require("./db/users/mdb-findone");
const getPublication = require("./db/publish/mdb-find");
const verDatos = require("./ver-datos");
const expHbs = require("express-handlebars");
const expSession = require("express-session");
const flash = require("connect-flash");
/**/
app.use(
  expSession({
    secret: ["esto me esta costando una banda"],
    resave: false,
    saveUninitialized: false,
    path: '/',
  })
);
//flash
app.use(flash());
/*** Configuración de Handlebars para Express ***/
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.engine(
  "handlebars",
  expHbs({
    defaultLayout: "private-layout",
    layoutsDir: "views/layouts",
    partialsDir: "views/partials",
  })
);
app.use("/js", express.static(path.join(__dirname + "/node_modules/bootstrap/dist/js"))); 
app.use("/css",express.static(path.join(__dirname, "/node_modules/bootstrap/dist/css")));

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

app.use((req, res, next)=>{
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");

  next();
});
//Este endpoint redirecciona siempre a "login" cuando se trata de ingresar a una ruta no autorizada o inexistente

// GET inicial, envia hacia el registro por ahora
//mi idea es hacer una vista más con botones hacia login o register
app.get("/", (req, res) => {
  res.render("login", { layout: "public-layout" });
});
//Una vez logueado se puede ver el feed de publicaciones (faltan estilos)
app.get("/home",auth, (req, res) =>{

  let mainTitle;
  getPublication.getAllPublications(
    (err) => {
      console.log(err);
      res.render("error", {
        mensajeError: err,
      });
    },

    (allPublications) => {      
      mainTitle = "Feed";
      // Renderizo la vista "feed" con esos datos
      res.render("feed", {
        username: req.session.user.user,
        publications: allPublications,
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
  const PublicationDate = fechaYHora();
  let content = req.body.publication;
  let data = {
    date:PublicationDate,
    author:req.session.user,
    contenido: content,
  };
  console.log(content);
  createPublication(data, verDatos.error, (result) => {
    //console.log(result);
  });
  res.redirect("/home");
})
//+++++++++++++++++ LOGIN +++++++++++++++++++++++++++++++++
app.get("/login", (req, res) => {
  res.render("login", { layout: "public-layout" });
});
// POST a /login, verifica que user y password sean de un usuario registrado, en ese caso
//  redirecciona al feed, sino mensaje de error en la misma vista de logueo
app.post("/loginUsr", (req, res) => {
  const { user, pwd } = req.body;
  let error = [];
  //en la vista de logueo no debería enviar nada sin poner ambos datos, pero por precaución lo dejé
  if (!user || !pwd) {
    req.flash("error_msg", "No ha ingresado todos los datos");
    res.redirect("/login");
  }
  else {
    searchUser.searchByUsernameAndPass(user, pwd, (errorMsg) => {
      //hacer pagina de errores del servidor
      res.render("errorServer", { error: errorMsg, user, layout: "public-layout" });
    }, (userData) => {
      console.log(userData);
      if (userData) {
        req.session.user = userData;
        res.redirect("/home");        
      }
      else{
        req.flash("error_msg", "usuario y/o contraseña incorrectos");
        res.redirect("/login");
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
app.get("/register", (req, res)=>{
  res.render("register", {layout: "public-layout"});
});
app.post("/registerUsr", (req, res) => {

  const { user, pwd, pwdRep } = req.body;
  let data = {
    user: user,
    pwd: pwd,
  };
  //por el required del for no entraria al primer if, pero lo dejé hasta consultar
  if (!user || !pwd || !pwdRep) {

    req.flash("error_msg", "Deben completarse los tres campos");
    res.render("register", { user, layout: "public-layout" });
  }
  else if (pwd !== pwdRep) {

    req.flash("error_msg", "Las contraseñas ingresadas no coinciden");
    res.render("register", {user, layout: "public-layout" });
  }
  else {
    searchUser.searchByUsername(user,
      (errorMsg)=>{
        console.log(errorMsg);
      },
      (userData) => {
        console.log(userData);
        if (userData) {
          console.log("este usuario ya existe");
          setTimeout(() => {
            req.flash("error_msg", "Este usuario ya está registrado");
            //res.render("register", { user, pwd, pwdRep, layout: "public-layout" });
            res.redirect("/register")
          }, 3000);
          
        }
        else {
          userRegister(data, (errorMsg) => {
            res.render("errorServer", { error: errorMsg, user, layout: "public-layout" });
            },()=>{
              req.flash("success_msg", "Se ha registrado exitosamente");
              setTimeout(() => {
                res.redirect("/login");
              }, 3000);
              
            }      
          );
        }
      }
    )
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


app.get('*',function (req, res) {
  res.redirect('/home');
});
// Inicio server
app.listen(PUERTO, function () {
  console.log(`Servidor iniciado en puerto ${PUERTO}...`);
});

function fechaYHora() {
  const date = new Date();

  const anio = date.getFullYear().toString();
  const mes = (date.getMonth() + 1).toString().padStart(2, "0");
  const dia = date.getDate().toString().padStart(2, "0");
  const hora = date.getHours().toString().padStart(2, "0");
  const mins = date.getMinutes().toString().padStart(2, "0");
  const segs = date.getSeconds().toString().padStart(2, "0");
  const mils = date.getMilliseconds().toString();

  return `${dia}-${mes}-${anio}  ${hora}:${mins}`;
}
