'use strict';

const Session = require('express-session');
const MongoStore = require('connect-mongo')(Session);


var PackageJson = require('./package.json'),
    cliArgs     = require('commander'),
    Path        = require('path'),
    Config      = require("./Config"),
    Q           = require('q'),
    Uuid = require('uuid'),
    GlobalVars  = require('./GlobalVars');

cliArgs.version(PackageJson.version)
       .option('-d, --debug', 'turn debug level output.')
       .option('-p, --port <port #>', 'Attach and listen on this port.', Number, 8080)
       .option('-m, --minify', 'Minify output.')
       .option('-s, --static <path>', 'Path to static content.')
       .option('-t, --tmpdir <path>', 'Path to a folder where to store temporary files.', String, `${__dirname}/../../tmp`)
       .option('-w, --webroot <web root>', 'Prefix for the URI.', String, Config.webUrlRoot);

cliArgs.parse(process.argv);

if (!cliArgs.static) {
  console.log("Missing static content root");
  cliArgs.help();
  process.exit(1);
}

if (cliArgs.debug) {
  Q.longStackSupport = true;
}

if (cliArgs.minify === undefined) {
  cliArgs.minify = false;
}

cliArgs = GlobalVars.set(GlobalVars.KEYS.CLI_ARGS, Object.freeze(cliArgs));

var Express             = require('express'),
    FS                  = require('fs'),
    URL                 = require('url'),
    _                   = require('lodash'),
    CP                  = require('child_process'),
    Babel               = require('babel-core'),
    Handlebars          = require('handlebars'),
    ArdefactApi         = require("./mockApi"),
    createLogger        = require('common/Logging').createLogger,
    staticContentRouter = require('./routers/StaticContentRouter'),
    apiRouter           = require('./routers/ApiRouter'),
    loggingRouter       = require('./routers/loggingRouter');

var LOG = createLogger(__filename);


LOG.info(`Using ${cliArgs.static} as static content root`);
LOG.info(`Using ${cliArgs.webroot} as URL root`);

const rootURL = URL.parse(cliArgs.webroot); 
const rootURLPathname = rootURL.pathname.replace(/\/$/, '');

LOG.info(`Using ${rootURLPathname} as relative path`);

const headers = {
  "Access-Control-Allow-Origin" : `${rootURL.protocol}//${rootURL.host}`
};

var app = Express();

var createSession = () => {
  const session = Session(
    {
      secret: 'some secret, i dunno',
      genid: req => Uuid.v4(),
      store: new MongoStore({dbPromise: require('db/MongoDbConnectionHelper')._getConnection()}),
    }
  );
  return session;
};

var startApp = () => {
  var server = app.listen(
    cliArgs.port, function () {
      var host = server.address().address;
      var port = server.address().port;
      LOG.info(`listening at http://${host}:${port}`);
    });
};

app.use(createSession());
app.use(require('compression')({level : 1}));
app.use(loggingRouter.makeRouter());
app.use(`/api`, apiRouter.makeRouter(ArdefactApi, {headers : headers}));

/**
 * Serve JS files by first translating them through babel, unless we disable the translation.
 */
staticContentRouter.makeRouter(
  _.extend(
    {
      staticRoot       : cliArgs.static,
      headers          : headers,
      tmpDir           : cliArgs.tmpdir,
      handleBarOptions : {
        webRoot          : cliArgs.webroot,
        googleMapsAPIKey : 'AIzaSyD2hHo-yvP2vBAnsLF5TNyLnQDPVKAe8rs'
      }
    }, cliArgs))
                   .then(
                     router => {
                       app.use('/', router);

                       // everything else should be statically served.
                       app.use('/', Express.static(cliArgs.tmpdir));
                       startApp();
                     }).then(
  null, error => {
    LOG.error(error, "Couldn't create static content router");
    process.exit(1);
  });
