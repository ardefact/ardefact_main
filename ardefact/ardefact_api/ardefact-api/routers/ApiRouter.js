'use strict';
/**
 * Generates express router that serves FE REST endpoints
 *
 */

var express      = require('express'),
    _            = require('lodash'),
    createLogger = require('./../../../../common/Logging').createLogger;

var LOG = createLogger("apiRouter");

function makeRouter(ArdefactApi, options) {
  var restRouter = express.Router();

  var headers = _.extend({"Content-Type" : "application/json"}, options.headers);

  restRouter.get("/aymbii", (req, res) => {
    LOG.debug("/aymbii");
    ArdefactApi.getAYMBII(req.query.uid).then(items => {
      res.writeHead(200, headers);
      res.end(JSON.stringify(items));
    }, err => {
      LOG.error(err, "Couldn't get AYMBII");
      res.writeHead(500, headers);
      res.end();
    });
  });

  restRouter.get("/ardefact", (req, res) => {
    LOG.debug("/ardefact");
    ArdefactApi.getArdefact(req.query.id).then(ardefact => {
      var ret = ardefact.getOrElse({error : true, description : "item does not exist"});
      res.writeHead("error" in ret ? 404 : 200, headers);
      res.end(JSON.stringify(ret));
    }, function (err) {
      LOG.error(err, "Couldn't get ardefact");
      res.writeHead(500, headers);
      res.end();
    });
  });

  restRouter.get("/user", function (req, res) {
    LOG.debug("/user");
    ArdefactApi.getUser(req.query.id).then(maybeUser => {
      var ret = maybeUser.getOrElse({error : true, description : "user does not exist"});

      res.writeHead("error" in ret ? 404 : 200, headers);
      res.end(JSON.stringify(ret));
    }, err => {
      LOG.error(err, "couldn't get user");
      res.writeHead(500, headers);
      res.end();
    });
  });

  restRouter.get("/search", function (req, res) {
    ArdefactApi.search({keywords : req.query.keywords}).then(function (ardefacts) {
      res.writeHead(200, headers);
      res.end(JSON.stringify(ardefacts));
    });

  });

  return restRouter;
}

module.exports = {makeRouter : makeRouter};