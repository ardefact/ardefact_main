'use strict';

var Hashids = require('hashids'),
    Q = require('q'),
    _ = require('lodash'),
    Bcrypt = require('bcrypt');

var Mongoose             = require('mongoose'),
    AutoIncrement        = require('mongoose-auto-increment'),
    createMongooseSchema = require('json-schema-to-mongoose');

var ArdefactJSONSchemas = require('ardefact_json_schema'),
    ArdefactUtils = require('ardefact_utils');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

const COLLECTION_NAME = 'User';

const hashids = new Hashids(COLLECTION_NAME);

function makeSchema() {
  const convertedSchema =
          createMongooseSchema(ArdefactJSONSchemas.id_2_obj,
            ArdefactJSONSchemas.api.models.User);

  delete convertedSchema.hid;

  // add additional fields.
  _.extend(convertedSchema.first_name, {required:true});
  _.extend(convertedSchema.last_name, {required:true});
  _.extend(convertedSchema.display_name, {required:true});
  convertedSchema.password = {type : String, required : true};
  convertedSchema.traveler = {type : Boolean};
  convertedSchema.approved_seller = {type: Boolean};
  convertedSchema.auth_token = {type: String};

  // create indecies
  const mongooseSchema = new Mongoose.Schema(convertedSchema);
  mongooseSchema.index(
    {email : 1},
    {unique : true, background : true});
  mongooseSchema.index(
    {auth_token: "hashed"},
    {unique: true, background: true});
  mongooseSchema.index(
    {display_name: 1},
    {unique: true, background:true}
  );

  // register auto increment plugin for Users so that
  // _id is auto incremented for us.
  mongooseSchema.plugin(AutoIncrement.plugin, COLLECTION_NAME);

  // virtuals
  const hidVirtual = mongooseSchema.virtual('hid');
  hidVirtual.get(function() {
    return hashids.encode(this._id);
  });

  // instance methods
  mongooseSchema.methods.checkPassword = function(password) {
    const deferred = Q.defer();
    Bcrypt.compare(password, this.password, (err, matched) => {
      if (err) {
        deferred.reject(err);
      } else {
        if (matched) {
          deferred.resolve(this);
        } else {
          deferred.resolve(false);
        }
      }
    });
    return deferred.promise;
  };


  // statics
  mongooseSchema.statics.findByHid = function(hid) {
    const id = hashids.decode(hid)[0];
    return this.findById(id).exec();
  };

  mongooseSchema.statics.findByEmail = function(email) {
    return this.findOne({email: email}).exec();
  };

  mongooseSchema.statics.findByDisplayName = function(displayName) {
    return this.findOne({display_name:displayName}).exec();
  };

  mongooseSchema.statics.findByAuthToken = function(authToken, cb) {
    return this.find({auth_token: authToken})
      .exec((err, user) => {
        if (err) cb(err);
        else cb(undefined, user);
      });
  };

  return mongooseSchema;
}

var COMPILED_MODEL = false;

module.exports = {
  getSchema       : makeSchema,
  getModel        : mongooseInstance => {
    if (!mongooseInstance) {
      throw 'mongooseInstance is required.';
    }
    if (COMPILED_MODEL === false) {
      COMPILED_MODEL = mongooseInstance.model(COLLECTION_NAME, makeSchema());
    }
    return COMPILED_MODEL;
  },
  COLLECTION_NAME : COLLECTION_NAME
};



