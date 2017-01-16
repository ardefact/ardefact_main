'use strict';

var Express = require('express'),
    _ = require('lodash'),
    Uuid = require('uuid'),
    Bcrypt = require('bcrypt');

var ArdefactDatabaseBridge = require('ardefact_database_bridge'),
    ArdefactUtils = require('ardefact_utils');

var RestUtils = require('./RestUtils');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

function makeExpressRouter(db) {
  const restRouter = Express.Router();

  const makeEndPointRouter = requirePath => {
    return (req, res) => require(requirePath).handleRequest(req, res, db);
  };

  restRouter.post('/login', makeEndPointRouter('./controllers/login'));
  restRouter.post('/item', makeEndPointRouter('./controllers/item'));
  restRouter.post('/user', makeEndPointRouter('./controllers/user'));

  return restRouter;
}

module.exports = {
  makeRouter: makeExpressRouter,
};