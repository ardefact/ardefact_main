'use strict';

var Mongoose = require('mongoose');

var Mockgoose = require('mockgoose'),
    Proxyquire = require('proxyquire');

/**
 * Create a mongoose instance against in memory Mongo
 * @returns {*}
 */
function getInMemoryDatabase() {
  var mongoose = new Mongoose.Mongoose();

  return Mockgoose(mongoose)
    .then(() => {
      //DBHelper.setupDb(mongoose.connection);
      const DBHelper = require('../src/MongoDbConnectionHelper');
      return DBHelper.getMongooseConnection('', {mongooseInstance:mongoose})
        .then(() => mongoose);
    });
}

module.exports = {
  getInMemoryMongoose: getInMemoryDatabase
};