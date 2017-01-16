/**
 * Configure and create loggers for the rest of the system
 */
'use strict';

var Bunyan     = require('bunyan'),
    Maybe      = require('data.maybe'),
    _          = require('lodash'),
    GlobalVars = require('./../ardefact/ardefact_api/ardefact-api/GlobalVars');


var createLogger = (name, options) => {
  if (!options) {
    options = {};
  }
  
  // if the name is a filename then subtract the root dir name from it
  if (name.indexOf(__dirname) != -1) {
    name = "ardefact-api" + name.substring(_.size(__dirname));
  }
  if (!('debug' in options)) {
    options.debug = false;
  }
  var bunyanOptions = _.extend({name : name, level : options.debug ? 'debug':'info', src: options.debug  }, options ? options : {});
  return Bunyan.createLogger(bunyanOptions);
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
    const originalStart = start;
    return func => {
      return stuff => {
        var end = new Date().getTime();
        if (func) {
          func((end - start) / 1e3, (end - originalStart) / 1e3);
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