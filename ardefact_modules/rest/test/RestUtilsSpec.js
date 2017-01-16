'use strict';

var Chai = require('chai');

var ArdefactJsonSchema = require('json_schema');

var RestUtils = require('../src/RestUtils');

describe('REST server utilities.', function() {
  it('makeResult should conform to json schema', function(done) {
    const mockResult = RestUtils.makeResult(1337, 'foo', 0);

    Chai.expect(
      ArdefactJsonSchema.api.rest.returns.validateObject(mockResult))
      .to.equal(true);

    done();
  });
});