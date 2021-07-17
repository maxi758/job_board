//Prometo modular ;-(
const express = require("express");
const path = require("path");
const app = express();
const getPublication = require("./db/publications/getPublication");
const updateAvatar = require("./db/users/updateUser").updateAvatar;
const expHbs = require("express-handlebars");
const session = require("./routes/utils").session;
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const multer = require("multer");
const upload = require("./routes/utils").upload;
//Parse Cookie header and populate req.cookies with an object keyed by the cookie names
app.use(cookieParser("secret"));

//session config
app.use(session.expSession({
  secret: "secret",
  cookie: {
    maxAge: 4000000
  },
  resave: false,
  saveUninitialized: false,
  path: '/',
}));


//flash
app.use(flash());
/*** Configuración de Handlebars para Express ***/

app.set("views", path.join(__dirname, "views"));

app.engine(
  "handlebars",
  expHbs({
    defaultLayout: "private-layout",
    layoutsDir: "views/layouts",
    partialsDir: "views/partials",
  })
);
app.set("view engine", "handlebars");
var hbsHelper = expHbs.create({});
hbsHelper.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

app.use("/js", express.static(path.join(__dirname + "/node_modules/bootstrap/dist/js")));
//app.use("/js", express.static(path.join(__dirname + "/node_modules/@fontawesome/js"))); 
app.use("/css",express.static(path.join(__dirname, "/node_modules/bootstrap/dist/css")));
app.use("/css", express.static(path.join(__dirname, "/node")));

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

app.use((req, res, next)=> { 
  if (!req.user) 
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate'); 
  next(); 
}); 
//Este endpoint redirecciona siempre a "login" cuando se trata de ingresar a una ruta no autorizada o inexistente

// GET inicial, envia hacia el registro o home

const index = require("./routes/index");
app.use(index);
app.use("/", index);
//Una vez logueado se puede ver el feed de publicaciones (faltan estilos)

app.use("/home", index);

//++++++++++++++ PUBLICAR  ++++++++++++++++++++++
const publication = require("./routes/publications");
app.use(publication);
app.use("/add", publication);
app.use("/newPublication", publication); 
app.use("/search", publication);
app.use("/edit", publication);
app.use("/delete", publication);
//+++++++++++++++++ LOGIN +++++++++++++++++++++++++++++++++
const login = require("./routes/login");
app.use(login);
app.use("/loginForm", login);
app.use("/login", login);

//+++++++++++++ Me gustaria que confirme si realmente quiere salir, queda pendiente ++++++++++++++++
app.get("/logout",session.auth, (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});
//++++++++++++++ REGISTER ++++++++++++++++++++++++++++
const userRegister = require("./routes/register");
app.use(userRegister);
app.use("registerForm", userRegister);
app.use("register", userRegister);

//++++++++++++++++++++++++++++++++++++++++++++
app.get("/upload/:id", session.auth, (req, res) => {
  res.render("editUser", {username: req.session.user.user,
    img: (req.session.user.img).toString(),
    id: req.session.user._id});
});
app.post("/upload/:id", session.auth, upload.single("avatar"), (req, res)=>{
  
  updateAvatar(req.params.id, req.file.filename,
    (errorMsg)=>{
      console.log(errorMsg);
    },
    ()=>{

    } );
  res.redirect("/");
})
// la finalidad de este middleware es redireccionar a inicio o login 
//cuando se ingresen rutas inaccesibles
app.get('*',function (req, res) {
  res.redirect('/home');
});
// Inicio server
app.listen(PUERTO, function () {
  console.log(`Servidor iniciado en puerto ${PUERTO}...`);
});
