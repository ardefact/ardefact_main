"use strict";

var FS   = require('fs'),
    Path = require('path');

var Express        = require('express'),
    Bcrypt         = require('bcrypt'),
    _              = require('lodash'),
    CookieParser   = require('cookie-parser'),
    Uuid           = require('uuid'),
    Q              = require('q'),
    ReactDOMServer = require('react-dom/server'),
    Handlebars     = require('handlebars'),
    React          = require('react'),
    Webpack        = require('webpack');

var ExpressSession = require('express-session');
const MongoStore   = require('connect-mongo')(ExpressSession);


var WebpackConfig = require('./webpack.config');
var compiler      = Webpack(WebpackConfig);

var ArdefactUtils          = require('utils');
var ArdefactConfig         = require('config');
var ArdefactDatabaseBridge = require('db');

var cliArgs = require('commander').option('-p, --port <number>', 'port to server web content on', Number, ArdefactConfig.getConfig(ArdefactConfig.CONFIG_VARS.ARDEFACT_WEB_PORT)).parse(process.argv);

const LOG = ArdefactUtils.Logging.createLogger(__filename);

const WEB_PATH = Path.join(Path.dirname(__filename), "www2");


LOG.info(`Using ${WEB_PATH} for static content path`);

const HTML_TEMPLATE = Handlebars.compile(FS.readFileSync(`${WEB_PATH}/index.html`).toString());

function getLoggedInUser(req, db) {
  if (!req.cookies.auth_token) {
    return Q.resolve(false);
  }
  return ArdefactDatabaseBridge.collections.User.verifyAuthToken(req.cookies.auth_token, db);
}

function makeExpressRouter(db) {
  const UserModel = ArdefactDatabaseBridge.collections.User.getModel(db);
  const ItemFormModel = ArdefactDatabaseBridge.collections.ItemForm.getModel(db);
  const webRouter = Express.Router();

  webRouter.use(CookieParser());

  webRouter.get('/', (req, res, next) => {
    // TODO:  Only do this for form pages.
    if (!req.cookies || !req.cookies.auth_token && req.method == "GET" && req.url === '/' || req.url == 'login') {
      var csrf_token         = Uuid.v4();
      req.session.csrf_token = csrf_token;
      req.session.save();
      res.cookie("csrf_token", csrf_token);
    }
    next();
  });

  webRouter.post('/itemform', (req, res, next) => {
    getLoggedInUser(req, db).then(user => {
      if (!user) {
        res.status(403).end("Not authenticated");
      } else {
        var entry = _.extend(
          {
            submitter : user.email,
            last_touched_ms: new Date().toJSON()
          },
          req.body);
        delete entry.itemSubmitButton;
        // TODO: Use ItemFormModel when we ar ready to migrate from itemform
        db.connection.collection('itemform').save(entry, function (err, records) {
          if (err) {
            LOG.error(err);
            res.status(500).end("Couldn't save");
          } else {
            res.set('Content-Type', 'text/html');
            res.status(200).end(`thanks! <a href="/">Click to go back and submit more!</a>`);
          }
        });
        /*
        new ItemFormModel(entry).save().then(result => {
          LOG.info(result);
          res.set('Content-Type', 'text/html');
          res.status(200).end(`thanks! <a href="/">Click to go back and submit more!</a>`);
        })
          .catch(error => res.status(500).end("couldn't save"));
          */
      }
    }).catch(error => {
      LOG.error(error);
      res.status(500).end(error.toString());
    });
  });

  webRouter.post('/user_admin', (req, res, next) => {
    getLoggedInUser(req, db).then(user => {
        if (!user || !user.isAdmin()) {
          res.status(404).end("Not found.");
        } else {
          LOG.info(req.body);
          if (
            !req.body.display_name ||
            !req.body.first_name ||
            !req.body.last_name ||
            !req.body.email ||
            !req.body.password
          ) {
            res.status(400).end("Missing some fields....");
          } else {
            // TODO: use configured number of salt rounds instead of magic val.
            Bcrypt.hash(req.body.password, 12, function (err, result) {
              if (err) {
                res.status(500).end(JSON.stringify(err));
              } else {
                new UserModel(
                  {
                    display_name : req.body.display_name.trim(),
                    first_name   : req.body.first_name.trim(),
                    last_name    : req.body.last_name.trim(),
                    email        : req.body.email.trim(),
                    password     : result
                  })
                  .save()
                  .then(() => res.status(200).end())
                  .catch(error => res.status(400).end(JSON.stringify(error)));
              }
            });
          }
        }
      })
      .catch(error => res.end(500, JSON.stringify(error)));
  });

  webRouter.post('/item_list', (req, res, next) => {
    getLoggedInUser(req, db).then(user => {
      if (!user || !user.isAdmin()) {
        res.status(404).end();
      } else {
        LOG.info("Querying db for itemform items");
        db.connection.collection('itemform').find().toArray((error, docs) => {
          if (error) {
            res.status(500).end(JSON.stringify(error));
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).end(JSON.stringify(docs));
          }
        })
      }

    });

  });

  webRouter.use('/', Express.static(WEB_PATH));

  // Always return the main index.html, so react-router render the route in the client
  webRouter.get('*', (req, res) => {
    res.sendFile(Path.resolve(WEB_PATH, 'index.html'));
  });

  return webRouter;
}

module.exports = {
  makeWebRouter : makeExpressRouter
};
