const multer = require("multer");


const uploadStorage = multer.diskStorage({
  destination: (req, file, cbCarpetaArchivo) => {
    cbCarpetaArchivo(undefined, "imgs");
  },
  filename: (req, file, cbNombreArchivo) => {
    extension = file.originalname.slice(file.originalname.lastIndexOf("."));
    console.log(extension);

    nombre = "img-" + fechaYHora() + extension;

    cbNombreArchivo(undefined, nombre);
  },
});

const upload = multer({
  storage: uploadStorage,
});

module.exports = upload;
