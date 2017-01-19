'use strict';

var ArdefactDatabaseBridge = require('db'),
    ArdefactUtils = require('utils'),
    RestUtils = require('./../RestUtils');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

function get_user(req, res, db) {
  // TODO implement this
  const startTimeMs = Date.now();

  LOG.debug(req.path);

  RestUtils.writeSuccess(res, 200, {}, startTimeMs);
}


module.exports = {
  get_user: get_user
};
