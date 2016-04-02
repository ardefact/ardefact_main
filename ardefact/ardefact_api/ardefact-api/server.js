'use strict';

var PackageJson = require('./package.json'),
    cliArgs     = require('commander'),
    GlobalVars = require('./GlobalVars');

cliArgs.version(PackageJson.version).
option('-d, --debug', 'turn debug level output').
  option('-p, --port <port #>', 'Attach and listen on this port', Number, 8080).
  option('-m, --minify', 'Minify output').
  option('-s, --static <path', 'Server this content statically under /', String, __dirname + "/../../ardefact_web/ardefact-web/");

cliArgs.parse(process.argv);

if (cliArgs.minify === undefined) {
  cliArgs.minify = false;
}

cliArgs = GlobalVars.set(GlobalVars.KEYS.CLI_ARGS, Object.freeze(cliArgs));

var Express             = require('express'),
    FS                  = require('fs'),
    _                   = require('lodash'),
    Sys                 = require('sys'),
    Path                = require('path'),
    CP                  = require('child_process'),
    Babel               = require('babel-core'),
    ArdefactApi         = require("./mockApi"),
    Config              = require("./Config"),
    createLogger        = require('./../../../Logging').createLogger,
    staticContentRouter = require('./routers/StaticContentRouter'),
    apiRouter           = require('./routers/ApiRouter'),
    loggingRouter       = require('./routers/loggingRouter');

var LOG = createLogger(__filename);

if (cliArgs.debug) {
  LOG.info("Using verbose output");
}

var headers = {
  "Access-Control-Allow-Origin" : Config.webUrlRoot,
};

// run Bower for static content
LOG.info("Running bower....");
var bowerOutput = CP.execSync(`cd "${cliArgs.static}"; "${__dirname}/node_modules/bower/bin/bower" install -p`).toString();
LOG.info(bowerOutput);


var app = Express();

var startApp = () => {
  var server = app.listen(cliArgs.port, function () {
    var host = server.address().address;
    var port = server.address().port;
    LOG.info(`listening at http://${host}:${port}`);
  });
};

app.use(require('compression')({level : 1}));
app.use(loggingRouter.makeRouter());
app.use('/api', apiRouter.makeRouter(ArdefactApi, {headers : headers}));

/**
 * Serve JS files by first translating them through babel, unless we disable the translation.
 */
staticContentRouter.makeRouter(_.extend({staticRoot : cliArgs.static, headers : headers}, cliArgs)).then(router => {
  if (cliArgs.minify) {
    app.use('/js/main.js', router);
  } else {
    app.use('/js', router);
  }

  // everything else should be statically served.
  app.use('/', Express.static(cliArgs.static));
  startApp();
}, error => {
  LOG.error(error, "Couldn't create static content router");
  Sys.exit(1);
});
