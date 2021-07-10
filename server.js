//Prometo modular ;-(
const express = require("express");
const path = require("path");
const app = express();
const getPublication = require("./db/publications/getPublication");
const expHbs = require("express-handlebars");
const flash = require("flash");
const session = require("./routes/utils").session;
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
app.get("/home",session.auth, (req, res) =>{

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
const publication = require("./routes/publications");
app.use(publication);
app.use("/add", publication);
app.use("/newPublication", publication); 
app.use("search", publication);
//+++++++++++++++++ LOGIN +++++++++++++++++++++++++++++++++
const login = require("./routes/login");
app.use(login);
app.use("/login", login);
app.use("/loginUsr", login);

//+++++++++++++ Me gustaria que confirme si realmente quiere salir, queda pendiente ++++++++++++++++
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});
//++++++++++++++ REGISTER ++++++++++++++++++++++++++++
const userRegister = require("./routes/register");
app.use(userRegister);
app.use("register", userRegister);
app.use("userRegister", userRegister);

//++++++++++++++++++++++++++++++++++++++++++++


app.get('*',function (req, res) {
  res.redirect('/home');
});
// Inicio server
app.listen(PUERTO, function () {
  console.log(`Servidor iniciado en puerto ${PUERTO}...`);
});


