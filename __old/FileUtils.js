'use strict';

var FS = require('fs');

const mkDirSafeSync = path => {
  try {
    FS.mkdirSync(path);
  } catch(error) {
    if (error.code !== 'EEXIST') {
      return error;
    }
  }
  return undefined;
};

module.exports = {
  mkDirSafeSync: mkDirSafeSync
};