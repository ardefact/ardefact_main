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
    Webpack        = require('webpack'),
    fileUpload     = require('express-fileupload'),
    ExifImage      = require('exif').ExifImage;

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

  webRouter.use(fileUpload());

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
        db.connection.collection('itemforms').save(entry, function (err, records) {
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

  webRouter.post('/a/item_form', (req, res, next) => {

    getLoggedInUser(req, db).then(user => {
      if (!user) {
        res.status(403).end("Not authenticated");
      } else {

        let data = {
          name: req.body.name,
          location: req.body.location,
          cost: req.body.cost,
          rarity: req.body.rarity,
          isCluster: req.body.isCluster,
          submitter : user.email,
          last_touched_ms: + new Date()
        };

        ItemFormModel.findOne({ 'submitter': user.email }, function (err, result) {

          LOG.info(result);

          if(result) {

            result = _.extend(result, data);
            result['pictures'] = [{uris: {full: "xxxxxx"}}, {uris: {full: "xxxxxx2"}}];
            result.save().then(
              result => {
                res.set('Content-Type', 'text/html');
                res.status(200).end();
              }
            );
          }
          else {
            ItemFormModel.create(data).then(
              result => {
                res.set('Content-Type', 'text/html');
                res.status(200).end();
              }
            );
          }

        }).catch(err => LOG.error(err));
      }

    });
  });

  webRouter.get('/a/item_form', (req, res, next) => {
    getLoggedInUser(req, db).then(user => {
      if (!user) {
          res.status(404).end();
      } else {
        ItemFormModel.findOne({ 'submitter': user.email }, function (err, result) {
            res.status(200).end(JSON.stringify(result));
        }).catch(err => LOG.error(err));
      }
    });
  });

  webRouter.post('/upload', (req, res, next) => {
    getLoggedInUser(req, db).then(user => {
      if (!user) {
        res.status(404).end();
      } else {

        let sampleFile = req.files.userImage;
        let fileName = user.email + +new Date();
        sampleFile.mv(WEB_PATH + '/uploads/' + fileName, function(err) {
          if (err) {
            LOG.error(err);
            return res.status(500).send(err);
          }


          new ExifImage({ image : WEB_PATH + '/uploads/' + fileName }, function (err, exifData) {
            if (err)
              LOG.error(err)
            else
              console.log(exifData); // Do something with your data!
          });

          ItemFormModel.findOne({ 'submitter': user.email }, function (err, result) {

            if(result) {
              if( Object.prototype.toString.call( result['pictures'] ) === '[object Array]' ) {
                result['pictures'].push({uris: {full: fileName}});
              }
              else {
                result['pictures'] = [{uris: {full: fileName}}];
              }
              result.save().then(
                result => {
                  res.set('Content-Type', 'text/html');
                  res.status(200).end();
                }
              );
            }
            else {
              let data = {
                submitter : user.email,
                last_touched_ms: + new Date(),
                pictures: [{uris: {full: fileName}}]
              };

              ItemFormModel.create(data).then(
                result => {
                  res.set('Content-Type', 'text/html');
                  res.status(200).end();
                }
              );
            }

          }).catch(err => LOG.error(err));

        });
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
