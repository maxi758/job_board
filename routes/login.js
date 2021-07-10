const express = require("express");
const getUser = require("../db/users/db-users").getUser;
const path = require("path");
const session = require("./utils");

const routerLogin = express.Router();

routerLogin.get("/login", (req, res) => {
  res.render("login", { layout: "public-layout" });
});
// POST a /login, verifica que user y password sean de un usuario registrado, en ese caso
//  redirecciona al feed, sino mensaje de error en la misma vista de logueo
routerLogin.post("/loginUsr", (req, res) => {
  const { user, pwd } = req.body;
  let error = [];
  //en la vista de logueo no debería enviar nada sin poner ambos datos, pero por precaución lo dejé
  if (!user || !pwd) {
    req.flash("error_msg", "No ha ingresado todos los datos");
    res.redirect("/login");
  }
  else {
    getUser.searchByUsernameAndPass(user, pwd, (errorMsg) => {
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

module.exports = routerLogin;