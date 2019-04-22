const debug = require('debug')('app:dbHelper')
var DB_OBJECT;

function getConnector(db) {
  var connector = null;
  switch (db.adapter) {
    case 'mongodb':
      connector = process.env.MONGO_URI || 
            `mongodb://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`;
  }
  return connector;
}

function connectMongoose(db, callback) {
  var mongoose = require('mongoose');
  mongoose.connect(getConnector(db),
  function (err) {
    if (err) {
        debug("DB Error: ", err);
        process.exit(1);
    } else {
        debug('MongoDB connected, database:', db.database);
        DB_OBJECT = mongoose;
        callback();
    }
  });
}

function dropMongooseDatabase(callback) {
  DB_OBJECT.connection.db.dropDatabase((err) => {
    if (err) callback(err)
    else callback()
  });
}

function establishConnection(db, callback) {
  switch (db.adapter) {
    case 'mongodb':
      connectMongoose(db, callback);
      break;
  }
}

function destroyConnection(db) {
  
}

function dropDatabase(db, callback) {
  switch (db.adapter) {
    case 'mongodb':
      dropMongooseDatabase(callback);
      break;
  }
}

module.exports = {
  establishConnection: establishConnection,
  dropDatabase: dropDatabase
};
