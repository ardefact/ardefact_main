'use strict';

var _ = require('lodash');

var ArdefactConfig = require('config');

var JSON_HEADERS =
      {
        'Content-Type' : 'application/json',
      };

if (ArdefactConfig.isDebugMode()) {
  JSON_HEADERS['Access-Control-Allow-Origin'] = '*';
}

function makeResult(errorCode, errorMessage, startTimeMs, results) {
  if (!results) {
    results = {};
  }
  return {
    error   : {
      code    : errorCode,
      message : errorMessage
    },
    stats   : {
      server_time_ms : Date.now() - startTimeMs
    },
    results : results
  };
}

const writeError = (req, res, httpCode, msg) => {
  res.writeHead(httpCode, JSON_HEADERS);
  res.end(JSON.stringify(makeResult(1, JSON.stringify(msg), req.startTimeMs)));
};

const writeSuccess = (req, res, httpCode, results) => {
  res.writeHead(httpCode, JSON_HEADERS);
  res.end(JSON.stringify(makeResult(0, undefined, req.startTimeMs, results)));
};

function getUploadPath() {
  return process.env.NODE_PATH + '/web/www2/uploads/';
}

module.exports = {
  makeResult   : makeResult,
  writeError   : writeError,
  writeSuccess : writeSuccess,
  getUploadPath: getUploadPath
};