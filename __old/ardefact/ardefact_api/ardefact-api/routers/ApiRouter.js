'use strict';
/**
 * Generates express router that serves FE REST endpoints
 *
 */

var express      = require('express'),
    _            = require('lodash'),
    CookieParser = require('cookie-parser'),
    Q = require('q'),
    Bcrypt       = require('bcrypt'),
    BodyParser   = require('body-parser'),
    createLogger = require('common/Logging').createLogger;

var User = require('model/User');

var LOG = createLogger("apiRouter");

function makeRouter(ArdefactApi, options) {
  var restRouter = express.Router();

  restRouter.use(CookieParser());

  restRouter.use(BodyParser.urlencoded({ extended: false }));
  restRouter.use(BodyParser.json());

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

  restRouter.post("/login", (req, res) => {
    LOG.info(req.body, "body of request");
    
    const writeError = error => {
      LOG.error(error, "login error");
      res.writeHead(403, headers);
      res.end();
    };

    User.byEmail(req.body.email)
        .then(user => {
          if (user && user.length === 1) {
            LOG.info(user, "USA");
            return Q.nfcall(Bcrypt.compare, req.body.password, user[0].password)
              .then(success => {
                if (success) {
                  req.session.authenticated = true;
                  res.cookie("authenticated", "true");
                  res.writeHead(200, headers);
                  res.end("true");
                } else {
                  throw "passwords do not match";
                }
              });
          } else {
            throw "user not found";
          }
        }).
      catch(writeError);
  });
  
  restRouter.post("/logout", (req, res) => {
    if (req.session && req.session.store) {
      req.session.store.clear(error => {
        if (error) {
          LOG.error(error, "couldn't logout");
          res.writeHead(500, headers);
        } else {
          res.writeHead(200, headers);
        }
        res.end();
      });
    } else {
      res.writeHead(200, headers);
      res.end();
    }
  });

  return restRouter;
}

module.exports = {makeRouter : makeRouter};