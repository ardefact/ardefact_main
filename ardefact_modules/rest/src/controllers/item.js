'use strict';

var ArdefactDatabaseBridge = require('ardefact_database_bridge'),
    ArdefactUtils = require('ardefact_utils');

var RestUtils = require('./../RestUtils');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

function handleRequest(req, res, db) {
  const startTimeMs = Date.now();

  const ItemModel = ArdefactDatabaseBridge.collections.Item.getModel(db);
  LOG.debug(`Looking up item by hid ${req.body}`);
  ItemModel.findByHid(req.body.hid)
    .then(item => {
      if (item) {
        RestUtils.writeSuccess(res, 200, item, startTimeMs);
      } else {
        RestUtils.writeError(res, 403, 'item not found', startTimeMs);
      }
    })
    .catch(error => RestUtils.writeError(res, 500, error, startTimeMs));
}

module.exports = {
  handleRequest: handleRequest
};
