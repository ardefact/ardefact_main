/**
 * Just lev fucking around.
 */
'using strict';

global.CLIArgs = {debug : true};

var StaticRouter = require('./routers/StaticContentRouter'),
    Logging      = require('./../../../Logging'),
    Q            = require('q');

var LOG = Logging.createLogger(__filename);

/*
 StaticRouter.getAllFiles("/home/lev/Desktop").
 then(console.log("got files")).
 then(files => StaticRouter._.copyFiles(files, "/home/lev/tmp/")).
 then(Logging.debug(LOG, "Dem files"), (err)=>console.log(err));
 */

/*
 StaticRouter.getAllFiles("/home/lev/c0de").
 then(StaticRouter._.makeTree).
 then(StaticRouter._.findCommonRoot).
 then(console.log);
 */

StaticRouter._.preProcessStaticContent({
  staticRoot    : "/home/lev/c0de/ardefact_main/ardefact_web/ardefact-web",
  tmpDir        : "/home/lev/tmp",
  doNotBabelify : [
    ".*bower_components.*"
  ]
}).then(()=> {
}, error => LOG.error(error));
