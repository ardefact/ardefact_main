'use strict';

var Server    = require('./src/server');
var ApiRouter = require('./src/ApiRouter');


var itemForm = require('./src/controllers/itemForm');
var item = require('./src/controllers/item');
var request = require('./src/controllers/request');

module.exports = {
  start          : () => Server.makeRestServer(process.argv),
  makeRestRouter : ApiRouter.makeRouter,
  itemForm: itemForm,
  item: item,
  request: request
};

if (!module.parent) {
  Server.makeRestServer(process.argv);
}
