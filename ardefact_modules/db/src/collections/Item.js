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

const COLLECTION_NAME = 'Item';

const hashids = new Hashids(COLLECTION_NAME);

function makeSchema() {
  const convertedSchema =
          createMongooseSchema(ArdefactJSONSchemas.id_2_obj,
            ArdefactJSONSchemas.api.models.Item);

  delete convertedSchema.hid;

  const mongooseSchema = new Mongoose.Schema(convertedSchema,
    {
      strict: true
    });

  mongooseSchema.index(
    {original_poster_hid: "hashed"},
    {background: true});
  mongooseSchema.index(
    {cluster_hid: "hashed"},
    {background:true});

  // register auto increement plugin for Users so that
  // _id is auto incremented for us.
  mongooseSchema.plugin(AutoIncrement.plugin, COLLECTION_NAME);

  // virtuals
  mongooseSchema.virtual('hid').get(function(){
    return hashids.encode(this._id);
  });

  // statics
  mongooseSchema.statics.findByHid = function(hid) {
    const id = hashids.decode(hid)[0];
    return this.findById(id).exec();
  };

  return mongooseSchema;
}

var COMPILED_MODEL = false;

module.exports = {
  getSchema: makeSchema,
  getModel: mongooseInstance => {
    if (!mongooseInstance) {
      throw 'mongooseInstance is required.';
    }
    if (COMPILED_MODEL === false) {
      COMPILED_MODEL = mongooseInstance.model(COLLECTION_NAME, makeSchema());
    }
    return COMPILED_MODEL;
  },
  COLLECTION_NAME: COLLECTION_NAME
};
