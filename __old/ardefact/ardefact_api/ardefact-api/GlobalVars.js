'use strict';

global.ARDEFACT_GLOBAL_DATA = {};
var GLOBAL_DATA = global.ARDEFACT_GLOBAL_DATA;

module.exports = {
  set: (key,val) => {GLOBAL_DATA[key] = Object.freeze(val); return GLOBAL_DATA[key];},
  get: key => GLOBAL_DATA[key],
  KEYS: {
    CLI_ARGS: 1
  }
};
