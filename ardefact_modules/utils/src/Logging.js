'use strict';

var Bunyan = require('bunyan'),
    _ = require('lodash');

var ArdefactConfig = require('config');

function createLogger(name, options) {
  if (!options) {
    options = {};
  }

  const level = ArdefactConfig.isDebugMode() ? 'debug': 'info';

  var bunyanOptions = _.extend(
    {
      name : name,
      level : level,
      src: ArdefactConfig.isDebugMode()
    }, options);
  return Bunyan.createLogger(bunyanOptions);
}

module.exports = {
  createLogger: createLogger
};