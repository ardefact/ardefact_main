'use strict';

var ArdefactRest = require('ardefact_rest'),
    ArdefactConfig = require('ardefact_config'),
    ArdefactUtils = require('ardefact_utils');


const LOG = ArdefactUtils.Logging.createLogger(__filename);

var Express = require('express');

const app = Express();

ArdefactRest.makeRestRouter()
  .then(restRouter => {
    app.use('/a', restRouter);
    const server = app.listen(ArdefactConfig.getConfig(), () => {
      var host = server.address().address;
      var port = server.address().port;
      LOG.info(`Listening on ${host}:${port}`);
    })
  });
