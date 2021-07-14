const Object_Id = require("mongodb").ObjectID;
const mongoClient = require("mongodb").MongoClient;
const dbConfig = require("./dbConfig");

const getAllPublications = (cbError, cbData) => {

  mongoClient.connect(dbConfig.url, function(err, client) {

    if (err) {
      console.log("Hubo un error conectando con el servidor:", err);
      cbError(err);
      return;
    }

    const job_board = client.db(dbConfig.db);
    const colPublish = job_board.collection(dbConfig.coleccion);

    colPublish.find().sort({_id : -1}).toArray(function(err, data) {

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

const getPublicationById = (id, cbError, cbData) => {

  mongoClient.connect(dbConfig.url, function(err, client) {

    if (err) {
      console.log("Hubo un error conectando con el servidor:", err);
      cbError(err);
      return;
    }

    const job_board = client.db(dbConfig.db);
    const colPublish = job_board.collection(dbConfig.coleccion);

    colPublish.findOne({_id: Object_Id(id)}, (err, data)=> {

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


const filterByWord =(string,cbError, cbData) => {

  mongoClient.connect(dbConfig.url, function(err, client) {

    if (err) {
      console.log("Hubo un error conectando con el servidor:", err);
      cbError(err);
      return;
    }

    const job_board = client.db(dbConfig.db);
    const colPublish = job_board.collection(dbConfig.coleccion);

    colPublish.find({$text:{$search: string}}).toArray(function(err, data) {

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


module.exports ={
  getAllPublications,
  filterByWord,
  getPublicationById,
} ;