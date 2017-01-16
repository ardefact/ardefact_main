'use strict';

var MongoDb = require('./MongoDbConnectionHelper');

module.exports = {
  getDb: () => MongoDb
};