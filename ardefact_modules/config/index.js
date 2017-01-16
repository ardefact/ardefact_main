'use strict';

var Config = require('./src/Config');

module.exports = Config;


if (!module.parent) {
  console.log(Config.getConfig(process.argv[2]));
}
