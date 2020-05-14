const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/flipBook";
const dbName = "nodeJsEval";
class Mongo {
  constructor() {
    if (!Mongo.instance) {
      MongoClient.connect(
        url,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err, client) => {
          if (err) throw err;
          Mongo.instance = client.db(dbName);
          console.log("db connecté");
        }
      );
    }
  }
  getInstance() {
    return Mongo.instance;
  }
}
module.exports = new Mongo();
