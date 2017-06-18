"use strict";

process.env.NODE_PATH = `${__dirname}/ardefact_modules`;
require("module").Module._initPaths();

var FS = require('fs');

var Bluebird = require('bluebird');

var Webpack = require('webpack');

var ArdefactUtils = require('utils');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

function runWebpack() {
  const config = require('web/webpack.config.js');

  var compiler = Webpack(config);

  return new Bluebird((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        reject(error);
      } else {
        resolve(stats);
      }
    });
  });

}

if (!module.parent) {
  var now = Date.now();
  runWebpack()
    .then(stats => LOG.info(`built buldle.js in ${Date.now() - now} ms`))
    .catch(error => LOG.error(error));
}

module.exports = runWebpack;