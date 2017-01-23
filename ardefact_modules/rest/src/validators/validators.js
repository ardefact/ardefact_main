'use strict';

var Q = require('q');

var LOG = require('utils').Logging.createLogger(__filename);

var RestUtils = require('../RestUtils');

function wrapEndpointWithValidators(endpoint, validators) {
  return (req, res, db) => {
    validators.reduce(Q.when, Q({req:req, res:res, db:db}))
      .then(() => endpoint(req, res, db))
      .catch(error => {
        RestUtils.writeError(req, res, 500, error);
        LOG.error(error);
      })
      .done();
  }
}

function validUser(args) {
  return require('./../controllers/login').verifyAuthToken(args.req.body.auth_token, args.db)
    .then(valid => {
      if (valid) {
        return args;
      } else {
        return Q.reject("Bad auth token");
      }
    });
}


module.exports = {
  wrapEndpointWithValidators: wrapEndpointWithValidators,
  validUser: validUser,
};