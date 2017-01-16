'use strict';

var Bcrypt = require('bcrypt'),
    Uuid = require('uuid'),
    Q = require('q'),
    _ = require('lodash');

var ArdefactDatabaseBridge = require('db'),
    ArdefactUtils = require('utils');

var RestUtils = require('./../RestUtils');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

function handleRequest(req, res, db) {
  const startTimeMs = Date.now();
  const UserModel = ArdefactDatabaseBridge.collections.User.getModel(db);
  LOG.debug(`Looking up user by email ${req.body.email}`);
  UserModel.findByEmail(req.body.email)
    .then(user => {
      if (user) {
        const givenPassword = req.body.password;

        user.checkPassword(givenPassword)
          .then(success => {
            if (success) {
              if (user.auth_token) {
                RestUtils.writeSuccess(res, 200,  {auth_token : user.auth_token}, startTimeMs);
              } else {
                user.auth_token = Uuid.v4();
                user.save()
                  .then(() => RestUtils.writeSuccess(res, 200, {auth_token : user.auth_token}, startTimeMs))
                  .catch(error => RestUtils.writeError(res, 500, "Couldn't save auth token", startTimeMs));
              }
            } else {
              RestUtils.writeError(res, 404, "invalid email or password", startTimeMs);
            }
          });

      } else {
        RestUtils.writeError(res, 404,  "invalid email or password", startTimeMs);
      }
    })
    .catch(error => RestUtils.writeError(res, 500, error, startTimeMs));
}

/**
 * verifies that auth token belongs to a given user and is valid
 * @param authTokenHid
 * @param db
 * @returns {boolean}
 */
function verifyAuthToken(authTokenHid, db) {
  if (authTokenHid) {
    const authTokenParts = authTokenHid.split(',');
    if (authTokenParts.length != 2) {
      return Q.reject("auth token string has more than one comma");
    }

    const userHid = authTokenParts[0];
    const authToken = authTokenParts[1];

    const UserModel = ArdefactDatabaseBridge.collections.User.getModel(db);

    return UserModel.findByHid(userHid)
      .then(user => authToken === user.auth_token);

  } else {
    return Q.reject("no token given");
  }
}

module.exports = {
  handleRequest: handleRequest,
  verifyAuthToken: verifyAuthToken,
};