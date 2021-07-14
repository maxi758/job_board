const express = require("express");
const path = require("path");
const createPublication = require("../db/publications/db-publications").createpublication;
const getPublication = require("../db/publications/db-publications").getPublication;
const updatePublication = require("../db/publications/db-publications").updatePublication;
const session = require("./utils").session;
const dateAndHour = require("./utils").dateAndHour;
const routerPublication = express.Router();

routerPublication.get("/add", session.auth, (req, res) => {
  
  let title = " crear publicacion";
  res.render("newPublictn", { username: req.session.user.user , title })
});
routerPublication.post("/newPublication", (req, res) => {
  let content = req.body.publication;
  let data = {
    date:dateAndHour,
    author:req.session.user,
    contenido: content,
  };
  console.log(content);
  createPublication(data, verDatos.error, (result) => {
    //console.log(result);
  });
  res.redirect("/home");
});


routerPublication.post("/search", (req, res)=>{
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

routerPublication.get("/editForm/:id", session.auth, (req,res)=>{
  getPublication.getPublicationById(req.params.id,
    (errorMsg)=>{
      console.log(errorMsg);
      res.render("errorServer");
    },
    (publicationData)=>{
      console.log(publicationData);
      res.render("editPublication", {username: req.session.user.user,
        publication:publicationData} );
    });
  
});

routerPublication.post("/edit/:id", session.auth, (req, res)=>{
  const id = req.params.id;
  const editPublication = req.body.editPublication;
  updatePublication(id.toString(), editPublication,
    (errorMsg)=>{
      console.log(errorMsg);
      res.render("errorServer");
    },
    (publicationData)=>{
      res.redirect("/home");
    } )
})
module.exports = routerPublication;