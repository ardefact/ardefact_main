'use strict';

var _ = require('lodash');

const JSON_HEADERS = {'Content-Type': 'application/json'};

function makeResult(errorCode, errorMessage, startTimeMs, results) {
  if (!results) {
    results = {};
  }
  return _.extend({
    error: {
      code: errorCode,
      message: errorMessage
    },
    stats: {
      server_time_ms: Date.now() - startTimeMs
    }
  }, results);
}

const writeError = (res, httpCode, msg, startTimeMs) => {
  res.writeHead(httpCode, JSON_HEADERS);
  res.end(JSON.stringify(makeResult(1, JSON.stringify(msg), startTimeMs)));
};

const writeSuccess = (res, httpCode, results, startTimeMs) => {
  res.writeHead(httpCode, JSON_HEADERS);
  res.end(JSON.stringify(makeResult(0, undefined, startTimeMs, results)));
};

module.exports = {
  makeResult: makeResult,
  writeError: writeError,
  writeSuccess: writeSuccess
};