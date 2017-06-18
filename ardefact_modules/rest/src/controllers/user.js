'use strict';

var Q = require('q');

var ArdefactDatabaseBridge = require('db'),
    ArdefactUtils          = require('utils'),
    RestUtils              = require('./../RestUtils'),
    Validators             = require('./../validators/validators');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

function _get_user(req, res, db) {
  const UserModel = ArdefactDatabaseBridge.collections.User.getModel(db);
  if (!req.body.hid) {
    RestUtils.writeError(req, res, 400, 'no hid given');
    return Q.resolve();
  } else {
    return UserModel.findByHid(req.body.hid)
      .then(user => {
        if (user) {
          RestUtils.writeSuccess(req, res, 200, user);
        } else {
          RestUtils.writeError(req, res, 404, "Couldn't find user");
        }
      });
  }
}

const get_user = Validators.wrapEndpointWithValidators(
  _get_user,
  [Validators.validUser]
);


module.exports = {
  get_user : get_user
};
