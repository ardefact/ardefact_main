'use strict';

var bunyan = require('bunyan'),
    _      = require('lodash'),
    GlobalVars = require('./ardefact/ardefact_api/ardefact-api/GlobalVars');

var CLIArgs = GlobalVars.get(GlobalVars.KEYS.CLI_ARGS);

var createLogger = (name, options) => {
  // if the name is a filename then subtract the root dir name from it
  if (name.indexOf(__dirname) != -1) {
    name = "ardefact-api" + name.substring(_.size(__dirname));
  }
  var bunyanOptions = _.extend({name : name, level : CLIArgs.debug ? 'debug' : 'info'}, options ? options : {});
  return bunyan.createLogger(bunyanOptions);
};

var DEFAULT_LOG = createLogger(__filename);

module.exports = {
  createLogger : createLogger,
  info(LOG, msg, func) {
    return stuff => {
      if (!func) {
        func = i => i;
      }
      LOG.info(func(stuff), msg);
      return stuff;
    };
  },
  debug(LOG, msg, func) {
    return stuff => {
      if (!func) {
        func = i => i;
      }
      LOG.debug(func(stuff), msg);
      return stuff;
    };
  },
  stopWatch() {
    var start = new Date().getTime();
    return func => {
      return stuff => {
        var end = new Date().getTime();
        if (func) {
          func((end - start) / 1e3);
        } else {
          DEFAULT_LOG.info("Took " + ((end - start) / 1e3) + " seconds ");
        }
        start = end;
        return stuff;
      };
    };
  },
  none() {
    return null;
  }
};