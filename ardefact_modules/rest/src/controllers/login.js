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


  LOG.info(`${req.session.csrf_token} -- ${req.body.csrf_token}`);

  if (req.session.csrf_token != req.body.csrf_token) {
    RestUtils.writeError(req, res, 404, "invalid csrf token");
  } else {
    req.session.csrf_token = Uuid.v4();
    req.session.save();
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
                      hid        : user.hid,
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
                          hid        : user.hid,
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
          RestUtils.writeError(req, res, 404, "invalid email or password");
        }
      })
      .catch(error => RestUtils.writeError(req, res, 500, JSON.stringify(error)));
  }
}

module.exports = {
  handleRequest: handleRequest,
};