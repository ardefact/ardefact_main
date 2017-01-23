'use strict';

var Uuid = require('uuid'),
    Q = require('q'),
    _ = require('lodash');

var ArdefactDatabaseBridge = require('db'),
    ArdefactUtils = require('utils');

var RestUtils = require('./../RestUtils');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

function handleRequest(req, res, db) {
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
                RestUtils.writeSuccess(
                  req,
                  res,
                  200,
                  {
                    auth_token : user.auth_token,
                    hid: user.hid,
                  }
                );
              } else {
                LOG.debug("saving auth token");
                user.auth_token = Uuid.v4();
                user.save()
                  .then(() => {
                    RestUtils.writeSuccess(
                      req,
                      res,
                      200,
                      {
                        auth_token : user.auth_token,
                        hid: user.hid,
                      }
                    );
                  })
                  .catch(error => {
                    LOG.error(error);
                    RestUtils.writeError(req, res, 500, "Couldn't save auth token");
                  });
              }
            } else {
              RestUtils.writeError(req, res, 404, "Invalid email or password");
            }
          });

      } else {
        RestUtils.writeError(req, res, 404,  "invalid email or password");
      }
    })
    .catch(error => RestUtils.writeError(req, res, 500, JSON.stringify(error)));
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
      .then(user => {
        if (user) {
          return authToken === user.auth_token
        } else {
          return Q.reject("wrong hid");
        }
      });

  } else {
    return Q.reject("no token given");
  }
}


module.exports = {
  handleRequest: handleRequest,
  verifyAuthToken: verifyAuthToken,
};