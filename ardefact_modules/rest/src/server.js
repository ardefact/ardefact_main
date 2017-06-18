'use strict';

var Express = require('express');

var ArdefactUtils          = require('utils'),
    ArdefactDatabaseBridge = require('db'),
    ArdefactConfig         = require('config');

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
      // use url encoded parameters in debug mode because we run rest and web server on different ports
      if (ArdefactConfig.isDebugMode()) {
        app.use(require('body-parser').urlencoded());
      }
      app.use(ApiRouter.makeRouter(db));

      const server = app.listen(cliArgs.port, () => {
        LOG.info(`Listening on port ${server.address().port}`);
      });
    })
    .catch(error => {
      LOG.error(error, "Couldn't connect to MongoDB");
    });
}

module.exports = {
  makeRestServer : makeRestServer,
};
