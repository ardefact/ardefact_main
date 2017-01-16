'use strict';

var express      = require('express'),
    createLogger = require('./../../../../common/Logging').createLogger;

var LOG = createLogger(__filename);

module.exports = {
  makeRouter : () => {
    var router = express.Router();

    router.get('*', (req, res, next) => {
      next();
      setTimeout(() => {
        // TODO: Come up with good access logs pattern
//        LOG.info(req.ip, req.originalUrl, "access");
      }, 0);
    });

    return router;
  }
};