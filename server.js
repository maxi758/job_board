const express = require("express");
const path = require("path");
const app = express();
const insertarUnProducto = require("./db/users/mdb-insertone");
const publish = require("./db/publish/mdb-insertone");
//const estaTomado = require("./client/mdb-findone");
const selectPublish = require("./db/publish/mdb-find");
const verDatos = require("./ver-datos");
const expHbs = require("express-handlebars");

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

// GET inicial, retorna la página login.html
app.get("/", function (req, res) {
  
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
  
        // Renderizo la vista "grilla" con esos datos
        res.render("feed", {
          publications: allPublictn,
          tituloResultados: result,
          title: mainTitle,
        });
      }
    );
  
});
//++++++++++++++ PUBLICAR  ++++++++++++++++++++++

app.get("/add", (req, res)=>{
  res.render("newPublictn")
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
  res.redirect("/");
})
// POST a /login, verifica que user y password sean de un usuario registrado, en ese caso
// avisa que está todo bien y redirecciona al inicio, sino mensaje de error
app.post("/login", function (req, res) {
  let flag = false;
  user = req.body.user;
  pwd = req.body.pwd;
  let result = usuarios;
  console.log(user, pwd, result);
  if (!user || !pwd ) {
    res.status(400).send({
      error: "Deben completarse todos los campos"
    });
    return;
  }
  else{
    for (let i = 0; i < result.length; i++) {
      console.log(result.length);
      if (user === result[i].user && pwd === result[i].pwd) {
        flag = true;
        res.status(200).send({
          url: "/home"
        });
        return;
      }    
    }
    if(!flag) {
      res.status(400).send({
        error: "Usuario y/o contraseña incorrectos"
      });
      return;
    }
  }
});


app.post("/register", function (req, res) {

  user = req.body.user;
  pwd = req.body.pwd;
  pwdRep = req.body.pwdRep;
  let data = {
    user : user,
    pwd : pwd,
  };
  
  if (!user || !pwd || !pwdRep) {
    res.status(400).send({
      error: "Deben completarse los tres campos"
    });
    return;
  }
  else if(pwd !== pwdRep){
    res.status(400).send({
      error: "La clave y su repetición no son iguales"
    });
    return;
  }
  else{
    console.log(estaTomado.estaTomado(user));
    estaTomado.estaTomado(user, result => {
      if (result) {
        console.log("este usuario ya existe");
        res.status(400).send({
          error: "Este usuario ya está registrado"
        });
        return;   
      }
      else {
        insertarUnProducto(data, verDatos.error, (resultado) => {
          console.log(resultado);
          consultarProductos(verDatos.error, verDatos.listaProductos);
        });
        res.status(200).send({
          url: "/home"
        });
      }
    });
  }
  
});
app.get("/home", (req, res)=>{
    res.sendFile(path.join(__dirname,"client/home.html"));
  })
// Inicio server
app.listen(PUERTO, function () {
  console.log(`Servidor iniciado en puerto ${PUERTO}...`);
});
