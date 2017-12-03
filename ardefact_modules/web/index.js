"use strict";

var FS   = require('fs'),
    Path = require('path');

var Express        = require('express'),
    Bcrypt         = require('bcrypt'),
    _              = require('lodash'),
    CookieParser   = require('cookie-parser'),
    Uuid           = require('uuid'),
    Q              = require('q'),
    React          = require('react'),
    FileUpload     = require('express-fileupload');

var ExpressSession = require('express-session');
//const MongoStore   = require('connect-mongo')(ExpressSession);


//var WebpackConfig = require('./webpack.config');
//var compiler      = Webpack(WebpackConfig);

var ArdefactUtils          = require('utils');
var ArdefactConfig         = require('config');
var ArdefactDatabaseBridge = require('db');
var ArdefactRouteControllers = require('rest');

//var cliArgs = require('commander').option('-p, --port <number>', 'port to server web content on', Number, ArdefactConfig.getConfig(ArdefactConfig.CONFIG_VARS.ARDEFACT_WEB_PORT)).parse(process.argv);

const LOG = ArdefactUtils.Logging.createLogger(__filename);

const WEB_PATH = Path.join(Path.dirname(__filename), "www2");

LOG.info(`Using ${WEB_PATH} for static content path`);

function makeExpressRouter() {

  const webRouter = Express.Router();

  webRouter.use(CookieParser());

  webRouter.use(FileUpload());

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

  webRouter.use('/api', (req, res, next) => {
    if (!req.cookies.auth_token) {
      return Q.resolve(false);
    }

    //TODO check for logged out routes

    ArdefactDatabaseBridge.collections.User.verifyAuthToken(req.cookies.auth_token, ArdefactDatabaseBridge.getDb()).then(user => {
      if (!user) {
        res.status(404).end();
      }
      else {
        res.locals.user = user;
        next();
      }
    }).catch(
      error => {
        res.end(500, JSON.stringify(error));
        LOG.error(error);
      }
    );
  });


  /*
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
  */

  webRouter.get('/api/item_list', ArdefactRouteControllers.item.get_items);

  webRouter.post('/api/item_form', ArdefactRouteControllers.itemForm.update_item_form);

  webRouter.get('/api/item_form', ArdefactRouteControllers.itemForm.get_item_form);

  webRouter.post('/api/item_form/image', ArdefactRouteControllers.itemForm.add_image);

  webRouter.delete('/api/item_form/image/:image_index', ArdefactRouteControllers.itemForm.remove_image);

  webRouter.post('/api/item',  ArdefactRouteControllers.item.create_item);

  webRouter.post('/api/request',  ArdefactRouteControllers.request.request_item);

  webRouter.get('/api/item/:id',  ArdefactRouteControllers.item.find_by_id);

  webRouter.delete('/api/item/:id',  ArdefactRouteControllers.item.remove_item);

  webRouter.use('/', Express.static(WEB_PATH));

  webRouter.get('*', (req, res) => {
    res.sendFile(Path.resolve(WEB_PATH, 'index.html'));
  });





  return webRouter;
}

module.exports = {
  makeWebRouter : makeExpressRouter
};
