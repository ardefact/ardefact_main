/**
 * Web server for static content
 */
'use strict';

var PackageJson = require('./package.json'),
    cliArgs     = require('commander'),
    Q           = require('q'),
    FS          = require('fs'),
    Path        = require('path'),
    Sys         = require('sys'),
    Express     = require('express'),
    _           = require('lodash'),
    GlobalVars  = require('./GlobalVars'),
    Config      = './Config';

cliArgs.version(PackageJson.version).
  option('-d, --debug', 'turn debug level on').
  option('-s, --static <path>').
  option('-m, --minify').
  option('-p, --port <port #>', 'Listen on this port.', Number, 8080);

cliArgs.parse(process.argv);
cliArgs = GlobalVars.set(GlobalVars.KEYS.CLI_ARGS, Object.freeze(cliArgs));

var LOG = require('./../../../Logging').createLogger(__filename);

if (!cliArgs.static || !cliArgs.port) {
  LOG.error("Required fields missing.");
  Sys.exit(1);
}

var headers = {
  "Access-Control-Allow-Origin" : Config.webUrlRoot
};

var app = Express();

app.use(require('compression')({level : 1}));
app.use('/', Express.static(cliArgs.static));

if (cliArgs.minify) {
  const serverEtag = Date.now();
  const jsHeaders = _.extend(
    {
      "Content-Type" : "application/javascript",
      "Etag"         : serverEtag
    }, headers);
  app.use(
    '/js/main.js', (req, res, next) => {
      const userEtag = req.headers['if-none-match'];
      if (serverEtag == userEtag) {
        res.writeHead(304, jsHeaders);
        res.end();
      } else {
        Q.nfcall(FS.readFile, Path.resolve(cliArgs.static + "/main-built.js")).then(
          data => {
            res.writeHead(200, jsHeaders);
            res.end(data);
          }, error => {
            LOG.error(error);
            res.writeHead(500);
            res.end(JSON.stringify(error));
          });
      }
    });
} else {
  app.use('/', Express.static(cliArgs.static));
}

var server = app.listen(
  cliArgs.port, () => {
    LOG.info(server, `listening at http://${server.address().address}:${server.address().port}`);
  });