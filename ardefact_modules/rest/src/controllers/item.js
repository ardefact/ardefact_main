'use strict';

var _ = require('lodash'),
    Q = require('q');

var ArdefactDatabaseBridge = require('db'),
    ArdefactUtils = require('utils'),
    RestUtils = require('./../RestUtils'),
    Validators = require('../validators/validators');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

function adaptItemForRest(mongooseItem) {
  return {
    hid: mongooseItem.hid,
    headline: mongooseItem.headline,
    detailed_info: mongooseItem.detailed_info,
    pictures: mongooseItem.pictures,
    created_at: mongooseItem.created_at,
  }
}

function get_item(req, res, db) {
  const ItemModel = ArdefactDatabaseBridge.collections.Item.getModel(db);
  LOG.debug(`Looking up item by hid ${req.body}`);
  if (!req.body.hid) {
    RestUtils.writeError(req, res, 400, 'no hid given');
    return Q.resolve();
  } else {
    return ItemModel.findByHid(req.body.hid)
      .then(
        item => {
          if (item) {
            RestUtils.writeSuccess(req, res, 200, adaptItemForRest(item));
          } else {
            RestUtils.writeError(req, res, 403, 'item not found');
          }
        })
      .catch(error => RestUtils.writeError(req, res, 500, error));
  }
}

get_item = Validators.wrapEndpointWithValidators(
  get_item,
  [Validators.validUser]
);


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

  return query.exec().then(items => {
    RestUtils.writeSuccess(req, res, 200, _.map(_.values(items), adaptItemForRest));
  })
    .catch(error => RestUtils.writeError(req, res, 500, error));
}

get_recent = Validators.wrapEndpointWithValidators(
  get_recent,
  [Validators.validUser]
);

module.exports = {
  get_item: get_item,
  get_recent: get_recent,
};
