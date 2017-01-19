'use strict';

var _ = require('lodash');

var ArdefactDatabaseBridge = require('db'),
    ArdefactUtils = require('utils'),
    LoginController = require('./login');

var RestUtils = require('./../RestUtils');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

function get_item(req, res, db) {
  const startTimeMs = Date.now();

  const ItemModel = ArdefactDatabaseBridge.collections.Item.getModel(db);
  LOG.debug(`Looking up item by hid ${req.body}`);
  ItemModel.findByHid(req.body.hid)
    .then(item => {
      if (item) {
        RestUtils.writeSuccess(req, res, 200, item);
      } else {
        RestUtils.writeError(req, res, 403, 'item not found');
      }
    })
    .catch(error => RestUtils.writeError(req, res, 500, error));
}

function get_recent(req, res, db) {
  const ItemModel = ArdefactDatabaseBridge.collections.Item.getModel(db);

  var condition = {};
  var count = 50;

  if (req.body.pagination) {
    if (req.body.pagination.after) {
      const afterTimeStamp = Number(req.body.pagination.after);
      condition = {"created_at.timestamp_ms" : {$lt : afterTimeStamp}};
    }

    if (req.body.pagination.count) {
      count = req.body.pagination.count;
    }
  }

  const query = ItemModel
    .find(condition)
    .limit(count)
    .sort({"created_at.timestamp_ms": -1});

  query.exec().then(items => {
    RestUtils.writeSuccess(req, res, 200, items);
  })
    .catch(error => RestUtils.writeError(req, res, 500, error));

}

module.exports = {
  get_item: get_item,
  get_recent: (req, res, db) => LoginController.validateRequest_validUser(req, res, db, get_recent),
};
