'use strict';

var _ = require('lodash'),
    Q = require('q');

var ArdefactDatabaseBridge = require('db'),
    ArdefactUtils          = require('utils'),
    RestUtils              = require('./../RestUtils'),
    Validators             = require('../validators/validators'),
    Hashids = require('hashids'),
    _ = require('lodash');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

var userHashids = new Hashids(ArdefactDatabaseBridge.collections.User.COLLECTION_NAME);

function adaptItemForRest(mongooseItem) {
  return {
    hid           : mongooseItem.hid,
    headline      : mongooseItem.headline,
    detailed_info : mongooseItem.detailed_info,
    pictures      : mongooseItem.pictures,
    created_at    : mongooseItem.created_at,
  };
}

function _get_item(req, res, next) {
  const ItemModel = ArdefactDatabaseBridge.collections.Item.getModel();
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

const get_item = Validators.wrapEndpointWithValidators(
  _get_item,
  [Validators.validUser]
);


function _get_recent(req, res, next) {
  const ItemModel = ArdefactDatabaseBridge.collections.Item.getModel();

  var condition = {};
  var count     = 50;

  if (req.body.pagination) {
    if (req.body.pagination.after) {
      const afterTimeStamp = Number(req.body.pagination.after);
      condition            = {"created_at.timestamp_ms" : {$lt : afterTimeStamp}};
    }

    if (req.body.pagination.count) {
      count = req.body.pagination.count;
    }
  }

  const query = ItemModel
    .find(condition)
    .limit(count)
    .sort({"created_at.timestamp_ms" : -1});

  return query.exec().then(items => {
      RestUtils.writeSuccess(req, res, 200, _.map(_.values(items), adaptItemForRest));
    })
    .catch(error => RestUtils.writeError(req, res, 500, error));
}

function create_item(req, res, next) {
  var user = res.locals.user;

  var id = user._id;

  var date = + new Date();

  var geo_location = {
    coordinate: [2, 4]
  };

  var headline = req.body.headline;

  var detailedInfo = req.body.detailedInfo;

  var ItemFormModel = ArdefactDatabaseBridge.collections.ItemForm.getModel();

  ItemFormModel.findByEmail(user.email).then(result => {
    var itemForm = result;

    var data = {
      original_poster_hid: userHashids.encode(id),
      created_at: {
        timestamp_ms: date,
        location: {
          geo_location: {
            coordinate: [2, 4]
          }
        }
      },
      headline: headline,
      detailed_info: detailedInfo,
      main_picture: itemForm.pictures[0],
      pictures: itemForm.pictures,
      rarity: req.body.rarity,
      is_cluster: req.body.isCluster,
      prices: [{
        amount: req.body.price
      }]
    };

    var ItemModel = ArdefactDatabaseBridge.collections.Item.getModel();
    var itemModel = new ItemModel(data);

    itemModel.save().then(result => {
      ItemFormModel.clearDraft(user.email).then(() => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).end(JSON.stringify(result));
      });

    });

  }).catch(err => {
    LOG.error(err);
    res.status(500).end();
  });

}

var get_items = (req, res, next) => {
  var ItemModel = ArdefactDatabaseBridge.collections.Item.getModel();
  ItemModel.find().sort({'created_at.timestamp_ms': -1}).then(result => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end(JSON.stringify(result));
  })
};

const get_recent = Validators.wrapEndpointWithValidators(
  _get_recent,
  [Validators.validUser]
);

const find_by_id = (req, res, next) => {
  var ItemModel = ArdefactDatabaseBridge.collections.Item.getModel();

  ItemModel.findOne({_id: req.params.id}).exec().then(result => {

    var UserModel = ArdefactDatabaseBridge.collections.User.getModel(ArdefactDatabaseBridge.getDb());

    UserModel.findByHid(result.original_poster_hid).then(result2 => {
      result = JSON.parse(JSON.stringify(result));
      result['user'] = result2;
      if(result2['_id'] == res.locals.user._id) {
        result['is_submitter'] = true;
      }
      else {
        result['is_submitter'] = false;
      }

      res.setHeader('Content-Type', 'application/json');
      res.status(200).end(JSON.stringify(result));
    });

  }).catch(err => {
    LOG.error(err);
    res.status(500).end();
  });
};

const remove_item = (req, res, next) => {
  var ItemModel = ArdefactDatabaseBridge.collections.Item.getModel();

  ItemModel.findOne({_id: req.params.id}).exec().then(result => {
    result.remove().then(() => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).end(JSON.stringify(result));
    });
  }).catch(err => {
    LOG.error(err);
    res.status(500).end();
  });
};

module.exports = {
  get_item   : get_item,
  get_recent : get_recent,
  create_item: create_item,
  get_items: get_items,
  find_by_id: find_by_id,
  remove_item: remove_item
};
