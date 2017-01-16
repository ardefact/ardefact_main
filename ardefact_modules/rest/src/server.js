'use strict';

var Express = require('express');

var ArdefactUtils = require('ardefact_utils'),
    ArdefactDatabaseBridge = require('ardefact_database_bridge');

var ApiRouter = require('./ApiRouter');


const LOG = ArdefactUtils.Logging.createLogger(__filename);

function makeRestServer(args, options) {
  const cliArgs = require('commander')
    .version(require('./../package.json').version)
    .option('-p, --port <port #>', 'Listen on this port', Number, 8081);

  cliArgs.parse(args);

  // connect to the database first, then start serving requests
  ArdefactDatabaseBridge.connect()
    .then(db => {
      LOG.info("Connected to DB.");

      const app = Express();
      app.use(require('body-parser').json());
      app.use(ApiRouter.makeRouter(db));

      const server = app.listen(cliArgs.port, () => {
        LOG.info(`Listening on port ${server.address().port}`);
      });
    })
    .catch(error => {
      LOG.error(error, "Couldn't connect to MongoDB");
    });
}

function makeRestRouter() {
  return ArdefactDatabaseBridge.connect()
    .then(db => ApiRouter.makeRouter(db));
}

module.exports = {
  makeRestServer: makeRestServer,
  makeRestRouter: makeRestRouter,
};