'use strict';

var FS           = require('fs'),
    PackageJson  = require('./package.json'),
    cliArgs      = require('commander'),
    GlobalVars = require('./GlobalVars');

cliArgs.version(PackageJson.version).
option('-d, --debug', 'turn on debug level output').
       option("-s, --static <path>", "Static content root", String, __dirname + '/../../ardefact_web/ardefact-web/').
       option("-o, --output <path>", "Root to the output", String, __dirname + ",../../deploy/");

cliArgs.parse(process.argv);

cliArgs = GlobalVars.set(GlobalVars.KEYS.CLI_ARGS, cliArgs);

var
    Q            = require('q'),
    StaticRouter = require('./routers/StaticContentRouter'),
    Logging      = require('./../../../common/Logging');

var LOG = Logging.createLogger(__filename);

StaticRouter._.preProcessStaticContent(
  {
    staticRoot    : cliArgs.static,
    tmpDir        : cliArgs.output,
    doNotBabelify : [
      ".*bower_components.*"
    ]
  }).then(
  minifiedData => {
    var outputFile = `${cliArgs.output}/main-built.js`;

    Q.nfcall(FS.writeFile, outputFile, minifiedData).then(() => {
      LOG.info(`Wrote to ${outputFile}`);
    }, error => {
      LOG.error(`Encountered error while writing to ${outputFile}`);
    });
  }, error => LOG.error(error));
