const express = require("express");
const path = require("path");
const userRegister = require("../db/users/db-users").createUser;
const getUser = require("../db/users/db-users").getUser;

const routerRegister = express.Router();

routerRegister.get("/register", (req, res)=>{
  res.render("register", {layout: "public-layout"});
});
routerRegister.post("/registerUsr", (req, res) => {

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
    getUser.searchByUsername(user,
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

module.exports = routerRegister;