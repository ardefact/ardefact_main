'use strict';

var Chai = require('chai');

var Schemas = require('./../index.js');

describe('Ardefact JSON Schema and helpers.', function () {
  it('serialize json schema then unserialize it', function (done) {
    const UserSchema = Schemas.api.models.User;

    Chai.assert.isOk(UserSchema, "Should exist.");

    const UserSchemaStr = JSON.stringify(UserSchema);

    Chai.assert.isOk(UserSchemaStr, "Seralized schema should be truthy.");
    Chai.expect(UserSchema).to.deep
      .equal(JSON.parse(Schemas.api.models.User_json));
    Chai.expect(UserSchema).to.deep
      .equal(Schemas.findById(UserSchema.id));

    done();
  });

  it('validate an object', function (done) {
    const tloc   = {
      "location"     : {
        "geo_location" : {
          "type"       : "Point",
          "coordinate" : [5.0, 3.0]
        }
      },
      "timestamp_ms" : 1337
    };
    const result = Schemas.validateSchema(
      tloc,
      Schemas.api.models.TLocation);

    Chai.expect(result).to.equal(true);
    Chai.expect(Schemas.api.models.TLocation.validateObject(tloc))
      .to.equal(true);

    Chai.expect(Schemas.validateSchema({}, Schemas.api.models.TLocation))
      .to.equal(false);

    done();
  });

  it("Schema obj should be frozen", function (done) {
    function modifySchemas() {
      Schemas.foo = "bar";
    }

    Chai.expect(modifySchemas).to
      .throw("Can't add property foo, object is not extensible");

    const schemaObj = Schemas.api.models.TLocation;

    function modifySchema() {
      schemaObj.foo = "bar";
    }

    Chai.expect(modifySchema).to
      .throw("Can't add property foo, object is not extensible");

    done();
  });

});