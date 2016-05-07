'use strict';

var _ = require('lodash');

var Config = require('../Config'),
    MongoDbConnectionManager = require('./MongoDbConnectionManager'),
  DbAware = require("./DbAware");

const requiredFields = ["email", "password", "profilePhotoId"];

function User(json) {
  if (json) {
    _.each(requiredFields, field => {
      if (!(field in json)) {
        throw field  + " is not in passed in object.";
    }});
    _.extend(this, json);
  }

  this.commit = () => {
    MongoDbConnectionManager.getConnection().then(db => {
      
    });
  };

};


User.prototype.byId = id => {
  

};

module.export = {
  User: User
};