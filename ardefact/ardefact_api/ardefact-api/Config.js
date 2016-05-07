'use strict';

var Path = require('path');

module.exports = {
  webUrlRoot : "http://localhost:8080",
  rPath      : Path.resolve(__dirname + Path.sep + "/lib/r.js"),
  db         : {
    url: "mongodb://localhost:27017/test"
  }
};
