'use strict';

var MongoClient           = require('mongodb').MongoClient,
    Mongoose              = require('mongoose'),
    MongooseAutoIncrement = require('mongoose-auto-increment'),
    Q                     = require('q');

var ArdefactUtils  = require('utils'),
    ArdefactConfig = require('config');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

const createConnection = options => {
  const deferred = Q.defer();

  MongoClient.connect(options.url, (err, db) => {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(db);
    }
  });
  return deferred.promise;
};

function put(db, collection, filter, object) {
  const deferred = Q.defer();
  try {
    db.collection(collection).replaceOne(
      filter,
      object,
      {upsert : true});
    deferred.resolve();
  } catch (error) {
    deferred.reject(error);
  }
  return deferred.promise;
}

/**
 * Creates a new mongoose instance connection and applies setupDb after.
 *
 * if options.mongooseInstance is provided, use that connection and jus run setupDb on it.
 * @param uri
 * @param options
 * @returns {*}
 */
function getMongooseConnection(uri, options) {
  if (!uri) {
    uri = ArdefactConfig.getConfig(
      ArdefactConfig.CONFIG_VARS.ARDEFACT_MONGODB_CONNECT_URL);
  }
  LOG.info(`Connecting to ${uri}`);
  if (!options) {
    options = {};
  }
  const mongoose = options.mongooseInstance ?
    options.mongooseInstance : new Mongoose.Mongoose();

  // plugin q as promise library
  mongoose.Promise = Q.Promise;

  mongoose.connect(uri, options, error => {
    if (error) {
      LOG.error(error);
    }
  });

  const db = mongoose.connection;

  const deferred = Q.defer();
  db.on('error', error => deferred.reject(error));
  db.on('open', () => {
    try {
      setupDb(db);
      LOG.info(`Connected to ${uri}`);
      deferred.resolve(mongoose);
    } catch (error) {
      deferred.reject(error);
    }
  });
  return deferred.promise;
}

/**
 * Things to execute after connecting to the database.
 *
 * @param db
 */
function setupDb(db) {
  MongooseAutoIncrement.initialize(db);
}

module.exports = {
  put                   : put,
  getMongooseConnection : getMongooseConnection,
  setupDb               : setupDb
};

