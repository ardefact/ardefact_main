'use strict';

var PackageJson = require('./package.json'),
    cliArgs     = require('commander'),
    Config      = require("./Config"),
    GlobalVars  = require('./GlobalVars');

cliArgs.version(PackageJson.version)
       .option('-d, --debug', 'turn debug level output')
       .option('-p, --port <port #>', 'Attach and listen on this port', Number, 8080)
       .option('-m, --minify', 'Minify output')
       .option('-s, --static <path>', 'Serve this content statically under /')
       .option('-w, --webroot <web root>', 'Prefix for the URI.', String, Config.webUrlRoot);

cliArgs.parse(process.argv);

if (!cliArgs.static) {
  console.log("Missing static content root")
  cliArgs.help();
  process.exit(1);
}

if (cliArgs.minify === undefined) {
  cliArgs.minify = false;
}

cliArgs = GlobalVars.set(GlobalVars.KEYS.CLI_ARGS, Object.freeze(cliArgs));

var Express = require('express'),
    FS      = require('fs'),
    URL     = require('url'),
    _       = require('lodash'),
    Sys     = require('sys'),
    Path    = require('path'),
    CP      = require('child_process'),
    Babel   = require('babel-core'),
    Handlebars          = require('handlebars'),
    ArdefactApi         = require("./mockApi"),
    createLogger        = require('./../../../Logging').createLogger,
    staticContentRouter = require('./routers/StaticContentRouter'),
    apiRouter           = require('./routers/ApiRouter'),
    loggingRouter       = require('./routers/loggingRouter');

var LOG = createLogger(__filename);

if (cliArgs.debug) {
  LOG.info("Using verbose output");
}

LOG.info(`Using ${cliArgs.static} as static content root`);
LOG.info(`Using ${cliArgs.webroot} as URL root`);

const rootURL = URL.parse(cliArgs.webroot); 

const headers = {
  "Access-Control-Allow-Origin" : `${rootURL.protocol}//${rootURL.host}`
};

/*
// run Bower for static content
LOG.info("Running bower....");
var bowerOutput = CP.execSync(`cd "${cliArgs.static}"; "${__dirname}/node_modules/bower/bin/bower" install -p`).toString();
LOG.info(bowerOutput);
*/


var app = Express();

var startApp = () => {
  var server = app.listen(
    cliArgs.port, function () {
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
staticContentRouter.makeRouter(_.extend({staticRoot : cliArgs.static, headers : headers}, cliArgs)).then(
  router => {
    if (cliArgs.minify) {
      app.use(`/js/main.js`, router);
    } else {
      app.use('/js', router);
    }

    const indexHtmlPath = Path.resolve(`${cliArgs.static}/_index.html`);
    
    // prepare index.html
    const indexHtml = Handlebars.compile(FS.readFileSync(indexHtmlPath).toString())(
      {
        webRoot : cliArgs.webroot,
        googleMapsAPIKey: 'AIzaSyD2hHo-yvP2vBAnsLF5TNyLnQDPVKAe8rs'
      });
    FS.writeFileSync(Path.resolve(`${cliArgs.static}/index.html`), indexHtml);


    // everything else should be statically served.
    app.use('/', Express.static(cliArgs.static));
    startApp();
  }).then(
  null, error => {
    LOG.error(error, "Couldn't create static content router");
    Sys.exit(1);
  })
