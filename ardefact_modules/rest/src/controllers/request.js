'use strict';

var Q = require('q');

var ArdefactDatabaseBridge = require('db'),
  ArdefactUtils          = require('utils'),
  RestUtils              = require('./../RestUtils'),
  Validators             = require('./../validators/validators');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

var db = ArdefactDatabaseBridge.getDb();

function request_item(req, res) {

  var user = res.locals.user;
  const RequestModel = ArdefactDatabaseBridge.collections.Request.getModel(db);

  var request = new RequestModel({'requester_hid' : user._id, 'item_hid': req.body.itemId, 'timestamp_ms': + new Date(), 'fulfilled' : false});
  request.save().then(result => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end(JSON.stringify(result));
  }).catch(err => {
    LOG.error(err);
    res.status(500).end();
  });
}

module.exports = {
  request_item : request_item
};
