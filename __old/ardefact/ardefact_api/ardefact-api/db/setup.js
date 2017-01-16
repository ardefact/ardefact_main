'use strict';

var Logging = require('common/Logging');

const LOG = Logging.createLogger(__filename);

var MongoDB = require('./MongoDbConnectionHelper'),
    User = require('model/User');

const setup = () => {
  LOG.info("Running database setup");
  
  return MongoDB._getConnection()
    .then(db => {
      LOG.info(`Got connection.  Creating indecies for ${User.COLLECTION}`);
      db.collection(User.COLLECTION)
        .createIndex({email:1}, {unique:true});
      return true;
    });
};

module.exports = {
  setup: setup
};