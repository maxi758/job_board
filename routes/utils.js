const express = require("express");
const app = express();
const expSession = require("express-session");

 app.use(
  expSession({
    secret: ["esto me esta costando una banda"],
    resave: false,
    saveUninitialized: false,
    path: '/',
  })
);
const auth = function(req, res, next) {
  if (req.session && req.session.user)
    return next();
  else
    return res.redirect("/");
};
const dateAndHour = ()=> {
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

const register = function(Handlebars) {
  const helpers = {
  inc: function(value, options) {
      return parseInt(value) + 1;
  },
  compare: function(var1, var2) {
    if (var1===var2) {
      return true;
    }
    else{
      return false;
    }
      
  }
};

if (Handlebars && typeof Handlebars.registerHelper === "function") {
  for (var prop in helpers) {
      Handlebars.registerHelper(prop, helpers[prop]);
  }
} else {
  return helpers;
}

};

module.exports.helpers = register(null); 
module.exports = {
  session :{
    expSession,
    auth,
  },
  
  dateAndHour,
  register,
} 