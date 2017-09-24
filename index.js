"use strict";

process.env.NODE_PATH = `${__dirname}/ardefact_modules`;
require("module").Module._initPaths();

var Express        = require('express'),
    ExpressSession = require('express-session'),
    MongoStore     = require('connect-mongo')(ExpressSession);

var ArdefactDatabaseBridge = require('db'),
    ArdefactUtils          = require('utils'),
    ArdefactConfig         = require('config'),
    ArdefactRest           = require('rest'),
    ArdefactWeb            = require('web');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

var cliArgs = require('commander')
  .option(
    '-p, --port <number>',
    'port to server web content on',
    Number,
    ArdefactConfig.getConfig(ArdefactConfig.CONFIG_VARS.ARDEFACT_WEB_PORT))
  .parse(process.argv);

ArdefactDatabaseBridge.connect()
  .then(db => {
    LOG.info("Connected to MongoDB.  Spinning up server.");

    var webRouter  = ArdefactWeb.makeWebRouter();
    var restRouter = ArdefactRest.makeRestRouter(db);

    const app = Express();

    app.set('trust proxy', 1);

    // use body parser
    app.use(require('body-parser').urlencoded({extended : true}));

    app.use(ExpressSession(
      {
        secret            : 'blargh-123-123',
        store             : new MongoStore({mongooseConnection : db.connection}),
        resave            : false,
        saveUninitialized : true,
      }
    ));

    app.use("/a", restRouter);
    app.use("/", webRouter);

    app.listen(cliArgs.port, () => {
      LOG.info(`Listening on ${cliArgs.port}`);
    });

  })
  .catch(error => {
    LOG.error(`Couldn't connect to database.  ${error.toString()}`);
  });
