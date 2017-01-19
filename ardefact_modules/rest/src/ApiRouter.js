'use strict';

var Express = require('express'),
    _ = require('lodash'),
    Uuid = require('uuid'),
    Bcrypt = require('bcrypt');

var ArdefactDatabaseBridge = require('db'),
    ArdefactUtils = require('utils');

var RestUtils = require('./RestUtils');

var UserControllers = require('./controllers/user');
var ItemControllers = require('./controllers/item');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

function makeExpressRouter(db) {
  const restRouter = Express.Router();

  const makeEndPointRouter = requirePath => {
    return (req, res) => require(requirePath).handleRequest(req, res, db);
  };

  const curryHandler = handler => (req, res) => handler(req, res, db);

  // record start time
  restRouter.all((req, res, next) => {
    req.startTimeMs = Date.now();
  });

  restRouter.post('/login', makeEndPointRouter('./controllers/login'));
  restRouter.post('/item/get_item', curryHandler(ItemControllers.get_item));
  restRouter.post('/item/get_recent', curryHandler(ItemControllers.get_recent));
  restRouter.post('/user/get_user', curryHandler(UserControllers.get_user));

  return restRouter;
}

module.exports = {
  makeRouter: makeExpressRouter,
};