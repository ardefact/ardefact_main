var _ = require('lodash');

var mongoose = require('mongoose');

mongoose.Promise = require('q').Promise;

var DBHelper = require('./src/MongoDbConnectionHelper'),
    User     = require('./src/collections/User'),
    Item     = require('./src/collections/Item'),
    ItemForm = require('./src/collections/ItemForm');

module.exports = {
  connect     : DBHelper.getMongooseConnection,
  collections : {
    User : User,
    Item : Item,
    ItemForm : ItemForm,
  }
};


