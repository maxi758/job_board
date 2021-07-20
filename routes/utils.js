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


const multer = require("multer");


const uploadStorage = multer.diskStorage({
  destination: (req, file, cbFileFolder) => {
    cbFileFolder(undefined, "client/img");
  },
  filename: (req, file, cbFileName) => {
    extension = file.originalname.slice(file.originalname.lastIndexOf("."));
    console.log(extension);

    nombre = "img-" + req.session.user.user + Date.now() + extension;

    cbFileName(undefined, nombre);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: {fieldSize:2048},
  fileFilter: (req, file, cb)=>{
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extName = filetypes.test(file.originalname);
    if (mimetype && extName) {
      return cb(undefined, true);
    }
    req.fileValidatorError ="Error: formato de arhivo no valido"; 
    cb(undefined, false, req.fileValidatorError);
  }
});

module.exports = {
  session :{
    expSession,
    auth,
  },
  
  dateAndHour,
  upload,
} 