const express = require("express");
const session = require("./utils").session;
const getPublication = require("../db/publications/db-publications").getPublication;

const routerIndex = express.Router();

routerIndex.get("/", (req, res) => {
  if (!req.session.user) {
    res.render("login", { layout: "public-layout" });
  }
  else{
    res.redirect("/home");
  }
  
});

routerIndex.get("/home",session.auth, (req, res) =>{

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
        id: req.session.user._id,
        img: (req.session.user.img).toString(),
        username: (req.session.user.user).toString(),
        publications: allPublications,
        title: mainTitle,
      });
    }
  );

});
module.exports = routerIndex;