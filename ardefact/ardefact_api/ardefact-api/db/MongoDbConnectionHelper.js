'use strict';

var MongoClient = require('mongodb').MongoClient,
  Q = require('q');

var Config = require('Config'),
  Logging = require('common/Logging');

var DbSetup = require('./setup');

const LOG = Logging.createLogger(__filename);

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
      .then(() => CONNECTION);
  } else {
    LOG.info("already thar!");
    return Q.fcall(() => CONNECTION);
  }
};

const get = (collection, query) => {
  const ret = [];
  return getConnection()
    .then(db => {
      const deferred = Q.defer();
      db.collection(collection)
        .find(query)
        .each((err, doc) => {
          if (err) {
            deferred.reject(err);
          } else {
            if (doc !== null) {
              ret.push(doc);
            } else {
              deferred.resolve(ret);
            }
          }
        });
      return deferred.promise;
    });
};

const put = (collection, object) => {
  return getConnection()
    .then(db => {
      const deferred = Q.defer();
      db.collection(collection).replaceOne({email: object.email}, object, (err, result) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve();
        }
      });
      return deferred.promise;
  });
};

const readAll = cursor => {
  const deferred = Q.defer();
  var semaphore = cursor.count();
  const results = [];
  cursor.each((err, data) => {
    if (err) {
      deferred.reject(err);
    } else {
      results.push(data);
      semaphore -= 1;
      if (semaphore === 0) {
        deferred.resolve(results);
      }
    }
  });

  return deferred.promise;
};

const all = (collection) => {
  return getConnection()
    .then(db => db.collection(collection).find().toArray());
};

module.exports = {
  get: get,
  put: put,
  all: all,
  _getConnection: getConnection
};

