'use strict';

var    Q = require('q');

var Config = require('./..Config'),
  MongoDbConnectionManager = require('./MongoDbConnectionManager');

const makeDbAware = obj => {
  return MongoDbConnectionManager.getConnection()
    .then(db => this._db = db);
};


module.exports = {
  makeDbAware: makeDbAware
};