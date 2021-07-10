const mongodb = require("mongodb");
const dbConfig = require("./dbConfig");

function insertPublication(publish, cbError, cbResult) {
  
  mongodb.MongoClient.connect(dbConfig.url, function(err, client) {

    if (err) {
      console.log("Hubo un error conectando con el servidor:", err);
      cbError(err);
      return;
    }

    const job_board = client.db(dbConfig.db);
    const colPublish = job_board.collection(dbConfig.coleccion);

    colPublish.insertOne(publish, function(err, result) {

      client.close();

      if (err) {
        console.log("Hubo un error al consultar:", err);
        cbError(err);
        return;
      }

      cbResult(result);
    });

  });

}

module.exports = insertPublication;