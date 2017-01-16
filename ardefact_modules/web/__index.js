'use strict';

var ArdefactRest   = require('rest'),
    ArdefactConfig = require('config'),
    ArdefactDatabaseBridge = require('db'),
    ArdefactUtils  = require('utils');


const LOG = ArdefactUtils.Logging.createLogger(__filename);

var Express = require('express');

const app = Express();

var DB;

ArdefactDatabaseBridge.connect()
  .then(db => DB = db)
  .then(() => {
      const restRouter = ArdefactRest.makeRestRouter(DB);

      app.post('/a', restRouter);
      app.get('/', Express.static('static'));

      const server = app.listen(
        ArdefactConfig.getConfig(ArdefactConfig.CONFIG_VARS.ARDEFACT_WEB_PORT),
        () => {
          var host = server.address().address;
          var port = server.address().port;
          LOG.info(`Listening on ${host}:${port}`);
        });
    })
  .fail(exception => LOG.error(exception));
