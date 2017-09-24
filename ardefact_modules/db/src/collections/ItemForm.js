

var Hashids = require('hashids'),
    Q       = require('q'),
    _       = require('lodash'),
    Bcrypt  = require('bcrypt');

var Mongoose             = require('mongoose'),
    AutoIncrement        = require('mongoose-auto-increment'),
    createMongooseSchema = require('json-schema-to-mongoose');

var ArdefactJSONSchemas = require('json_schema'),
    ArdefactUtils       = require('utils');

const COLLECTION_NAME = 'itemform';

const LOG = ArdefactUtils.Logging.createLogger(__filename);

var getDb = require('./../MongoDbConnectionHelper').getDb;

function makeSchema() {
  const convertedSchema =
          createMongooseSchema(
            ArdefactJSONSchemas.id_2_obj,
            ArdefactJSONSchemas.api.models.ItemForm);

  // create indecies
  // create indecies
  const mongooseSchema = new Mongoose.Schema(convertedSchema);
  mongooseSchema.index(
    {submitter : 1},
    {unique : false, background : true});
  mongooseSchema.index(
    {is_draft : 1},
    {unique : false, background : true}
  );

  mongooseSchema.statics.findByEmail = function(email) {
    return this.findOne({submitter : email}).exec();
  };

  mongooseSchema.statics.clearDraft = function(email) {
    return this.findOne({submitter : email}).remove().exec()
  };

  return mongooseSchema;
}

var COMPILED_MODEL = false;

function getModel() {
  var mongooseInstance = getDb();
  if (!mongooseInstance) {
    throw 'mongooseInstance is required.';
  }
  if (COMPILED_MODEL === false) {
    COMPILED_MODEL = mongooseInstance.model(COLLECTION_NAME, makeSchema());
  }
  return COMPILED_MODEL;
}

module.exports = {
  getSchema       : makeSchema,
  getModel        : getModel,
  COLLECTION_NAME : COLLECTION_NAME,
};