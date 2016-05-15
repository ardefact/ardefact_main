'use strict';

var _ = require('lodash'),
    Q = require('q');

var Config = require('../Config'),
    Logging = require('common/Logging'),
    DB = require('db/DbHelper').getDb();

const LOG = Logging.createLogger(__filename);

const requiredFields = ["email", "password", "displayName"];

const USER_COLLECTION = 'users';

function User(json) {
  if (json) {
    _.each(requiredFields, field => {
      if (!(field in json)) {
        throw field  + " is not in passed in object.";
    }});
    _.extend(this, json);
  }
  LOG.info(DB.toString(), "shiii");

  this.commit = () => DB.put(USER_COLLECTION, this);
}

User.COLLECTION = USER_COLLECTION;

User.byEmail = email => DB.get(USER_COLLECTION, {email:email});

User.all = () => DB.all(USER_COLLECTION);

module.exports = User;

