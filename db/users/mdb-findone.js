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


/**
 * Busca un usuario según usuario y contraseña
 * @param {string} user nombre de usuario
 * @param {string} pwd contraseña
 * @param {function} cbError callback de error
 * @param {function} cbData callback que recibe datos de usuario
 */
const searchByUsernameAndPass = (user, pwd, cbError, cbData)=>{

  mongodb.MongoClient.connect(dbConfig.url, (err, client)=> {

    if (err) {
      console.log("Hubo un error conectando con el servidor:", err);
      cbError("hubo un error en la conexion, por favor intente nuevamente mas tarde");
      return;
    }
    const job_board = client.db(dbConfig.db);
    const colUsers = job_board.collection(dbConfig.coleccion);
    colUsers.findOne({ user: user.toString(), pwd: pwd.toString() }, (err, userData)=>{
      if (err) {
        console.log("Hubo un error en la consulta", err);
        cbError("hubo un error en la conexion, por favor intente nuevamente mas tarde");
        return;
      }
      client.close();
      cbData(userData);
    });
    
  });
}

module.exports ={
  searchUser,
  searchByUsernameAndPass,
} 