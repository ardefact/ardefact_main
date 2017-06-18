'use strict';

var FS        = require('fs'),
    Path      = require('path'),
    _         = require('lodash'),
    Validator = require('jsonschema').Validator;

const id_2_obj       = {};
const validator      = new Validator();
const validateSchema =
        (obj, schema) => validator.validate(obj, schema).errors.length === 0;

function populate(obj, path, localName) {
  const fname = Path.resolve(Path.resolve(`${path}/${localName}`));
  if (localName.endsWith('.json')) {
    const jsonData = FS.readFileSync(fname).toString();
    var jsonObj    = JSON.parse(jsonData);

    // validate an object against a schema we are currently processing
    const validateThisSchema =
            obj => validateSchema(obj, jsonObj);

    // add a non enumerable helper method to schema obj.
    Object.defineProperty(
      jsonObj,
      'validateObject',
      {
        get        : function () {
          return validateThisSchema;
        },
        enumerable : false
      }
    );

    jsonObj = Object.freeze(jsonObj);

    const objName          = localName.replace(".json", "");
    obj[`${objName}_json`] = jsonData;
    obj[objName]           = jsonObj;
    id_2_obj[jsonObj.id]   = jsonObj;
    validator.addSchema(jsonObj, jsonObj.id);
  }
  else {
    const parentObj = obj[localName] = {};
    const children = FS.readdirSync(fname);
    for (var i = 0; i < children.length; i += 1) {
      populate(parentObj, fname, children[i]);
    }
  }
}
const schemas = {};
populate(schemas, __dirname, 'api');

schemas.findById       = id => id_2_obj[id];
schemas.id_2_obj       = id_2_obj;
schemas.validateSchema = validateSchema;

module.exports = Object.freeze(schemas);

