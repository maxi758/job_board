const mongodb = require("mongodb");
const dbConfig = require("./dbConfig");

function searchUser(user, cbError, cbDatos) {
  
  mongodb.MongoClient.connect(dbConfig.url, function(err, client) {

    if (err) {
      console.log("Hubo un error conectando con el servidor:", err);
      cbError(err);
      return;
    }

    const job_board = client.db(dbConfig.db);
    const colUsers = job_board.collection(dbConfig.coleccion);

    colUsers.find({ user : user }).toArray(function(err, datos) {

      client.close();

      if (err) {
        console.log("Hubo un error al consultar:", err);
        cbError(err);
        return ;
      }
      
      cbDatos(datos);
      
    });

  });

}
//falta pulir esto, no hace lo que quiero, seguramente por la asincronía
function isUserTaken(user, cb) {

  mongodb.MongoClient.connect(dbConfig.url, function(err, client) {

    if (err) {
      console.log("Hubo un error conectando con el servidor:", err);
      return ;
    }

    const job_board = client.db(dbConfig.db);
    const colUsers = job_board.collection(dbConfig.coleccion);

    let users = colUsers.find({ user : `${user}` }, function(err) {
      
      client.close();

      if (err) {
        console.log("Hubo un error al consultar:", err);
        return ;
      }
      
    });
    if (users) {
        cb(true);
    } else {
        cb(false);
    }
  });
  
}

module.exports ={
  searchUser : searchUser,
  isUserTaken : isUserTaken,
} 