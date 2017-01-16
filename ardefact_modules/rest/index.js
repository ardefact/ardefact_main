'use strict';

var Server = require('./src/server');
var ApiRouter = require('./src/ApiRouter');

module.exports = {
  start : () => Server.makeRestServer(process.argv),
  makeRestRouter: ApiRouter.makeRouter
};

if (!module.parent) {
  Server.makeRestServer(process.argv);
}
