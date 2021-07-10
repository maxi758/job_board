const mongodb = require("mongodb");
const dbConfig = require("./dbConfig");
const bcrypt = require("bcrypt");

function insertUser(users, cbError, cbResultado) {
  
  mongodb.MongoClient.connect(dbConfig.url, function(err, client) {

    if (err) {
      console.log("Hubo un error conectando con el servidor:", err);
      cbError(err);
      return;
    }

    const job_board = client.db(dbConfig.db);
    const colUsers = job_board.collection(dbConfig.coleccion);

    colUsers.insertOne(users, function(err, resultado) {

      client.close();

      if (err) {
        console.log("Hubo un error al consultar:", err);
        cbError(err);
        return;
      }

      cbResultado(resultado);
    });

  });

}

module.exports = insertUser;