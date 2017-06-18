"use strict";

var FS   = require('fs'),
    Path = require('path');

var Express        = require('express'),
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
        var entry = _.extend({submitter : user.email}, req.body);
        delete entry.itemSubmitButton;
        db.connection.collection('itemform').save(entry, function (err, records) {
          if (err) {
            LOG.error(err);
            res.status(500).end("Couldn't save");
          } else {
            res.set('Content-Type', 'text/html');
            res.status(200).end(`thanks! <a href="/">Click to go back and submit more!</a>`);
          }
        });
      }
    }).catch(error => {
      LOG.error(error);
      res.status(500).end(error.toString());
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
