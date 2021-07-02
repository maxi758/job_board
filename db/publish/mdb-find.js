const mongoClient = require("mongodb").MongoClient;
const dbConfig = require("./dbConfig");

function consultarTodos(cbError, cbData) {

  mongoClient.connect(dbConfig.url, function(err, client) {

    if (err) {
      console.log("Hubo un error conectando con el servidor:", err);
      cbError(err);
      return;
    }

    const job_board = client.db(dbConfig.db);
    const colPublish = job_board.collection(dbConfig.coleccion);

    colPublish.find().toArray(function(err, data) {

      client.close();

      if (err) {
        console.log("Hubo un error convirtiendo la consulta a Array:", err);
        cbError(err);
        return;
      }

      cbData(data);
    });

  });

}

module.exports = consultarTodos;