const mongodb = require("mongodb");
const dbConfig = require("./dbConfig");

const updatePublication = (stringId, content, cbError, cbResult)=> {
  mongodb.MongoClient.connect(dbConfig.url, (err, client)=> {
    if (err) {
      console.log("Hubo un error conectando con el servidor:", err);
      cbError(err);
      return;
    }

    const job_board = client.db(dbConfig.db);
    const colPublish = job_board.collection(dbConfig.coleccion);

    colPublish.findOneAndUpdate(
      { _id: mongodb.ObjectId(stringId.trim()) },
      {
        $set: {
          contenido: content,
        },
      },
      function (err, result) {
        client.close();

        if (err) {
          console.log("Hubo un error al consultar:", err);
          cbError(err);
          return;
        }

        cbResult(result);
      }
    );
  });
}

module.exports = updatePublication;
