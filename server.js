//Prometo modular ;-(
const express = require("express");
const path = require("path");
const app = express();
const userRegister = require("./db/users/mdb-insertone");
const publish = require("./db/publish/mdb-insertone");
const showPublictn = require("./db/publish/ver-datos");
const isTaken = require("./db/users/mdb-findone");
const selectPublish = require("./db/publish/mdb-find");
const verDatos = require("./ver-datos");
const expHbs = require("express-handlebars");
const mongodb = require("mongodb");
const dbConfig = require("./db/users/dbConfig");
const expSession = require("express-session");
let username;
/**/ 
app.use(
  expSession({
    secret: ["esto me esta costando una banda"],
    resave: false,
    saveUninitialized: false
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

// GET inicial, envia hacia el registro por ahora
//mi idea es hacer una vista más con botones hacia login o register
app.get("/", (req, res)=>{
  res.render("register", {layout: "empty-layout"}); 
});
//Una vez logueado se puede ver el feed de publicaciones (faltan estilos)
app.get("/home", function (req, res) {
  if (!req.session.username) {
    res.redirect("/login");
    return;
  }
    let mainTitle;
    let result;
  
    selectPublish(
      (err) => {
        console.log(err);
        res.render("error", {
          mensajeError: err,
        });
      },
  
      (allPublictn) => {
        if(allPublictn.length>0){
          result = `Hay ${allPublictn.length} resultado${
          allPublictn.length === 1 ? "" : "s"
        } para tu consulta:`;
        }
        else{
          result = "No hay resultados para tu consulta";
        }
        
  
        mainTitle = "Feed";
  
        // Renderizo la vista "feed" con esos datos
        res.render("feed", {
          username,
          publications: allPublictn,
          tituloResultados: result,
          title: mainTitle,
        });
      }
    );
  
});
//++++++++++++++ PUBLICAR  ++++++++++++++++++++++

app.get("/add", (req, res)=>{
  if (!username) {
    res.redirect("/login");
    return;
  }
  let title = " crear publicacion";
  res.render("newPublictn", {username, title} )
});
app.post("/newPublictn", (req,res)=>{
  let content = req.body.publication;
  let data = {
    contenido : content,
  };
  console.log(content);
  publish(data, verDatos.error, (result)=>{
    console.log(result);
  });
  res.redirect("/home");
})
//+++++++++++++++++ LOGIN +++++++++++++++++++++++++++++++++
app.get("/login", (req, res)=>{
  res.render("login", {layout: "empty-layout"});
});
// POST a /login, verifica que user y password sean de un usuario registrado, en ese caso
//  redirecciona al feed, sino mensaje de error en la misma vista de logueo
app.post("/loginUsr", async (req, res)=> {
  let errors = [];
  const {user, pwd} = req.body;
 
  //en la vista de logueo no debería enviar nada sin poner ambos datos, pero por precaución lo dejé
  if (!user || !pwd ) {
    
    res.render("login", {errors, user, pwd, layout: "empty-layout"});
  }
  else{
    mongodb.MongoClient.connect(dbConfig.url, async function(err, client) {
    
      if (err) {
        console.log("Hubo un error conectando con el servidor:", err);
        return;
      }
      const job_board = client.db(dbConfig.db);
      const colUsers = job_board.collection(dbConfig.coleccion);
      let result = await colUsers.find({user: user.toString(), pwd: pwd.toString()}).limit(1).toArray();
      client.close();
      console.log(result);
        if (result.length <= 0) {
          
          errors.push("Usuario y/o contraseña incorrectos");
          
          res.render("login", {errors, user, layout: "empty-layout"});   
        }
        else {
          req.session.username = user;
          username = req.session.username;
          res.redirect("/home");
        }
      });
    }

  
});
//+++++++++++++ Me gustaria que confirme si realmente quiere salir, queda pendiente ++++++++++++++++
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});
//++++++++++++++ REGISTER ++++++++++++++++++++++++++++
app.post("/registerUsr", async (req, res)=> {
  let errors = [];
  const {user, pwd, pwdRep} = req.body;
  let data = {
    user : user,
    pwd : pwd,
  };
  //por el required del for no entraria al primer if, pero lo dejé hasta consultar
  if (!user || !pwd || !pwdRep) {

    errors.push("Deben completarse los tres campos");
    res.render("register", {errors, user, layout: "empty-layout"});
  }
  else if(pwd !== pwdRep){
    
    errors.push ("La clave y su repetición no son iguales");
    res.render("register", {errors, user, layout: "empty-layout"});
  }
  else{
    mongodb.MongoClient.connect(dbConfig.url, async function(err, client) {
    
      if (err) {
        console.log("Hubo un error conectando con el servidor:", err);
        return;
      }
      const job_board = client.db(dbConfig.db);
      const colUsers = job_board.collection(dbConfig.coleccion);
      let result = await colUsers.find({user: user.toString()}).limit(1).toArray();
      client.close();
      console.log(result);
        if (result.length>0) {
          console.log("este usuario ya existe");
          
          errors.push("Este usuario ya está registrado");
          
          res.render("register", {errors, user, pwd, pwdRep, layout: "empty-layout"});   
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

// Inicio server
app.listen(PUERTO, function () {
  console.log(`Servidor iniciado en puerto ${PUERTO}...`);
});
