"use strict";

process.env.NODE_PATH = `${__dirname}/ardefact_modules`;
require("module").Module._initPaths();

var FS = require('fs'),
    _  = require('lodash'),
    Bluebird = require('bluebird'),
    UglifyJSPlugin = require('uglifyjs-webpack-plugin'),
    Webpack = require('webpack');

var ArdefactUtils = require('utils');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

function runWebpack(extraConfig) {
  if (!extraConfig) {
    extraConfig = {};
  }

  const config = require('web/webpack.config.js');

  var compiler = Webpack(_.extend(extraConfig, config));

  return new Bluebird((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        reject(error);
      } else {
        if (stats.hasErrors()) {
          reject(stats.toJson().errors);
        }
        resolve(stats);
      }
    });
  });

}

if (!module.parent) {

  var cliArgs = require('commander')
    .option('-m, --minify', 'Do minifcation.  Takes longer.')
    .parse(process.argv);

  var extraArgs = {};
  if (cliArgs.minify) {
    extraArgs.plugins = [];
    extraArgs.plugins.push(new UglifyJSPlugin(
      {
        compress: true,
        comments: false,
      }));
  }

  var now = Date.now();
  runWebpack(extraArgs)
    .then(stats => LOG.info(`built buldle.js in ${Date.now() - now} ms`))
    .catch(errors => {
      _.each(errors, error => console.error(error));
      process.exit(1);
    });
}

module.exports = runWebpack;