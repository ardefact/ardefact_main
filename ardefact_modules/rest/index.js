'use strict';

var Server = require('./src/server');

module.exports = {
  start : () => Server.makeRestServer(process.argv),
  makeRestRouter: Server.makeRestRouter,
};