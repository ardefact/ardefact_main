'use strict';

var FS = require('fs'),
    Path = require('path');

const CONFIG_VARS = {
  ARDEFACT_RUN_MODE            : "ARDEFACT_RUN_MODE",
  ARDEFACT_EXEC_NPM            : "ARDEFACT_EXEC_NPM",
  ARDEFACT_EXEC_NODE           : "ARDEFACT_EXEC_NODE",
  ARDEFACT_DEBUG_MODE          : "ARDEFACT_DEBUG_MODE",
  ARDEFACT_MONGODB_CONNECT_URL : "ARDEFACT_MONGODB_CONNECT_URL",
  ARDEFACT_WEB_URL_ROOT        : "ARDEFACT_WEB_URL_ROOT",
  ARDEFACT_REST_URL_ROOT       : "ARDEFACT_REST_URL_ROOT",
  ARDEFACT_BCRYPT_WORK_FACTOR  : "ARDEFACT_BCRYPT_WORK_FACTOR",
  ARDEFACT_WEB_PORT            : "ARDEFACT_WEB_PORT",
};

function getMode() {
  const mode = process.env[CONFIG_VARS.ARDEFACT_RUN_MODE];
  if (!mode) {
    return "dev";
  }
  return mode;
}

function isDebugMode() {
  return getConfig(CONFIG_VARS.ARDEFACT_DEBUG_MODE);
}

var FILE_CONFIG_CONTENTS = null;
function getConfigFromFile() {
  if (FILE_CONFIG_CONTENTS === null) {
    const configFileName =
            Path.resolve(__dirname + '/../cfg/' + getMode() + '.json');
    FILE_CONFIG_CONTENTS = JSON.parse(
      FS.readFileSync(configFileName, {encoding : 'utf8'}));
    FILE_CONFIG_CONTENTS = Object.freeze(FILE_CONFIG_CONTENTS);
  }
  return FILE_CONFIG_CONTENTS;
}

function getConfig(configName) {
  var ret = process.env[configName];
  if (!ret) {
    ret = getConfigFromFile()[configName];
  }
  if (ret !== undefined) {
    ret = ret.toString();
  }
  return ret;
}


module.exports = {
  isDebugMode: isDebugMode,
  getConfig: getConfig,
  CONFIG_VARS: CONFIG_VARS,

  _test: {
    getMode: getMode,
    getConfigFromFile: getConfigFromFile
  }
};
