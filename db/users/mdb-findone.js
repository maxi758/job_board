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
function isUserTaken(user) {
  try{
    mongodb.MongoClient.connect((dbConfig.url, {useNewUrlParser: true, useUnifiedTopology : true}, function(err, client) {
      assert.equal(null, err);
    //Step 1: declare promise
        
    var myPromise = () => {
      return new Promise((resolve, reject) => {
        const job_board = client.db(dbConfig.db);
        const colUsers = job_board.collection(dbConfig.coleccion);

          colUsers
          .find({user: user})
          .limit(1)
          .toArray(function(err, data) {
              err 
                ? reject(err) 
                : resolve(data[0]);
            });
      });
    };

    //Step 2: async promise handler
    var callMyPromise = async () => {
      
      var result = await (myPromise());
      //anything here is executed after result is resolved
      return result;
    };

    //Step 3: make the call
    callMyPromise().then(function(result) {
      client.close();
      
    });
  //end mongo client

  /*  let client = await mongodb.MongoClient.connect(dbConfig.url);

    const job_board = client.db(dbConfig.db);
    const colUsers = job_board.collection(dbConfig.coleccion);

    const doc =  colUsers.findOne({ user : user }, function(err) {
        
        client.close();

        if (err) {
          console.log("Hubo un error al consultar:", err);
          return ;
        }
        
    });
    console.log(doc);*/
  }));
  } catch (excepcion ) {
    excepcion.toString();
}
}

module.exports ={
  searchUser : searchUser,
  isUserTaken : isUserTaken,
} 