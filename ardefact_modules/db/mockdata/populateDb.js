'use strict';

var _             = require('lodash'),
    Q             = require('q'),
    Mongoose      = require('mongoose'),
    ArdefactUtils = require('utils');

var DBHelper = require('../src/MongoDbConnectionHelper');

var MockUsersData = require('./mockusers.json'),
    MockArdefacts = require('./mockardefacts.json');

var User = require('../src/collections/User'),
    Item = require('../src/collections/Item');

var LOG = require('bunyan').createLogger({name : "pop"});


function main(mongooseInstance) {
  return DBHelper.getMongooseConnection(undefined, {mongooseInstance : mongooseInstance})
    .then(
      mongooseInstance => {
        LOG.info("Connected.  Populating now....");
        return populateUsers(User.getModel(mongooseInstance))
          .then(() => populateItems(Item.getModel(mongooseInstance)));
      })
    .then(() => {
      LOG.info("All done!");
      process.exit(0);
    })
    .catch(error => LOG.error(error));
}

function populateUsers(UserModel) {
  const saveMockUser = i => new UserModel(MockUsersData[i]).save()
    .then(() => {
      if (i < MockUsersData.length - 1) return saveMockUser(i + 1);
    });

  return saveMockUser(0);
}

function populateItems(ItemModel) {
  const saveMockItem = i => new ItemModel(MockArdefacts[i]).save()
    .then(() => {
      if (i < MockArdefacts.length - 1) return saveMockItem(i+1);
    });

   return saveMockItem(0);
}

if (!module.parent) {
  main();
}

module.exports = {
  populateUsers : populateUsers,
  populateItems : populateItems,
  mockUsers     : MockUsersData,
  mockItems     : MockArdefacts
};