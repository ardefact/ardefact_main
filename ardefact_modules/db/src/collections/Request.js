'use strict';

var Hashids = require('hashids'),
  Q       = require('q'),
  _       = require('lodash');

var Mongoose             = require('mongoose'),
  AutoIncrement        = require('mongoose-auto-increment'),
  createMongooseSchema = require('json-schema-to-mongoose');

var ArdefactJSONSchemas = require('json_schema'),
  ArdefactUtils       = require('utils');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

var getDb = require('./../MongoDbConnectionHelper').getDb;

const COLLECTION_NAME = 'Request';
const USER_COLLECTION_NAME = require('./User').COLLECTION_NAME;

const hashids = new Hashids(COLLECTION_NAME);
const userHashids = new Hashids(USER_COLLECTION_NAME);

function makeSchema() {
  const convertedSchema =
    createMongooseSchema(
      ArdefactJSONSchemas.id_2_obj,
      ArdefactJSONSchemas.api.models.Request);

  delete convertedSchema.hid;

  const mongooseSchema = new Mongoose.Schema(
    convertedSchema,
    {
      strict : true
    });

  mongooseSchema.index(
    {"requester_hid" : 1},
    {background : true});
  mongooseSchema.index(
    {"timestamp_ms" : 1},
    {background : true});
  mongooseSchema.index(
    {"fulfilled" : 1},
    {background : true});
  mongooseSchema.index(
    {"item_hid" : 1},
    {background : true});

  // register auto increement plugin for Users so that
  // _id is auto incremented for us.
  mongooseSchema.plugin(AutoIncrement.plugin, COLLECTION_NAME);

  return mongooseSchema;
}

var COMPILED_MODEL = false;

module.exports = {
  getSchema       : makeSchema,
  getModel        : () => {
    var mongooseInstance = getDb();
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
