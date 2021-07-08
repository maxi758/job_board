const mongodb = require("mongodb");
const dbConfig = require("./dbConfig");


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

const searchByUsername = (user, cbError, cbData)=>{

  mongodb.MongoClient.connect(dbConfig.url, (err, client)=> {

    if (err) {
      console.log("Hubo un error conectando con el servidor:", err);
      cbError("hubo un error en la conexion, por favor intente nuevamente mas tarde");
      return;
    }
    const job_board = client.db(dbConfig.db);
    const colUsers = job_board.collection(dbConfig.coleccion);
    colUsers.findOne({ user: user.toString() }, (err, userData)=>{
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
  searchByUsernameAndPass,
  searchByUsername,
} 