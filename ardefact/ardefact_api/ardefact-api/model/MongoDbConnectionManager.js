'use strict';

var MongoClient = require('mongodb').MongoClient,
  Q = require('q');

var Config = require('../Config'),
  Logging = require('../Logg');

const createConnection = () => {
  const deferred = Q.defer();
  
  MongoClient.connect(Config.db.url, (err, db) => {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(db);
    }
  });
  return deferred.promise;
};

var CONNECTION = null;

const getConnection = () => {
  if (CONNECTION === null) {
    return createConnection()
      .then(db => CONNECTION = db)
      .then(() => CONNECTION)
  } else {
    return Q.fcall(() => CONNECTION);
  }
};

module.export = {
  getConnection: getConnection
};

