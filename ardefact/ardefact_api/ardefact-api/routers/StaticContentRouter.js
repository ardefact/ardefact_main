/**
 *
 */
'use strict';

var LOG = require('./../../../../Logging').createLogger(__filename);

var FS      = require('fs-extra'),
    Exec    = require('child_process'),
    Maybe   = require('data.maybe'),
    Babel   = require('babel-core'),
    Path    = require('path'),
    Q       = require('q'),
    _       = require('lodash'),
    Logging = require('./../../../../Logging'),
    Config  = require('./../Config');

const DEFAULT_TMP_DIR_PATH = '../../tmp';

const DEFAULT_BABEL_EXCLUDE_REGEX = [
  ".*bower_components.*"
];

var makeTree = files => {
  var Node = function (name) {
    this.name = name ? name : "";
    this.children = {};
  };

  var root = new Node("/");

  var insertIntoTree = parts => {
    var walker = root;
    _.each(parts, part => {
      var node = walker.children[part];
      if (!node) {
        node = walker.children[part] = new Node(part);
      }
      walker = node;
    });
  };
  _.each(files, file => insertIntoTree(file.split(Path.sep)));
  return root;
};

var findCommonRoot = rootNode => {
  var ret = "";
  var walker = rootNode;
  while (walker) {
    const numChildren = _.size(walker.children);
    ret += "/" + walker.name;
    if (numChildren > 1) {
      break;
    }
    walker = walker.children[_.keys(walker.children)[0]];
  }
  return Path.normalize(ret);
};

/**
 * Recursively collect all files in root
 * @param root
 * @param callback
 */
var getAllFiles = (root, _callback) => {
  var deferred = Q.defer();
  var allFiles = [];

  var callback = (err, files) => {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(files);
    }
    if (_callback) {
      _callback(err, files);
    }
  };

  var rec = (root, callback) => {
    FS.readdir(root, (err, files) => {
      if (err) {
        FS.exists(root, exists => {
          // if we can't read directory listing but the path exists it should be a file
          if (exists) {
            allFiles.push(root);
            callback(null, allFiles);
          } else {
            callback(err);
          }
        });
      }
      else if (files) {
        // go through the files

        // ues numFolders as a semaphore while we gather all files
        var numFolders = files.length;

        // return if we have no files/folders
        if (numFolders === 0) {
          callback(null, allFiles);
          return;
        }

        // otherwise make a recursive call with new semaphore counting callback
        var innerCallback = (err, data) => {
          if (err) {
            callback(err);
            return;
          }
          --numFolders;
          if (numFolders === 0) {
            callback(null, allFiles);
          }
        };

        _.each(files, file => {
          var fname = Path.resolve(root, file);
          rec(fname, innerCallback);
        });

      } else {
        callback();
      }
    });
  };

  rec(root, callback);
  return deferred.promise;
};

var copyFiles = (originalFiles, tmpRootFolder, _callback) => {
  LOG.info(`Copying ${_.size(originalFiles)} files into ${tmpRootFolder}`);
  var deferred = Q.defer();

  Q.fcall(() => makeTree(originalFiles)).then(findCommonRoot).then(Logging.debug(LOG, "Common root")).then(originalRoot => {
    const originalRootLength = _.size(originalRoot);
    var callback = (err, files) => {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(files);
      }
      if (_callback) {
        _callback(err, files);
      }
    };
    var semaphore = originalFiles.length;
    var copiedFiles = [];
    _.each(originalFiles, originalFile => {
      var destFile = Path.resolve(tmpRootFolder + Path.sep + originalFile.substr(originalRootLength));
      FS.copy(originalFile, destFile, err => {
        if (err) {
          semaphore = -1;
          callback(err, copiedFiles);
        } else {
          copiedFiles.push(destFile);
          semaphore -= 1;
          if (semaphore === 0) {
            callback(null, copiedFiles);
          }
        }
      });
    });
  }).then(()=> {
  }, err=>LOG.error(err, "Whoops!  Copying failed!"));

  return deferred.promise;
};

var requireJSConvert = (staticRoot, files, tmpDir) => {
  var deferred = Q.defer();
  const requireJsConfig = require(`${staticRoot}/js/main`);

  // function to run r.js
  var runR = () => {
    var rOptions = _.extend({
      baseUrl : ".",
      name    : "main",
      out     : Path.resolve(`${tmpDir}/main-built.js`)
    }, requireJsConfig);

    var configData = JSON.stringify(rOptions);
    configData = `(${configData})`;
    FS.writeFileSync(Path.resolve(tmpDir + "/js/rbuild.json"), configData);
    var tmpPath = Path.resolve(tmpDir + "/js");
    var rJsPath = Config.rPath;
    var cmd = `cd "${tmpPath}";  ${rJsPath} -o rbuild.json`;
    LOG.info("Will run requireJs for minification by running this command: " + cmd);
    Exec.exec(cmd, (err, sysout, syserr) => {
      if (err) {
        deferred.reject(err);
      }
      else if (syserr) {
        deferred.reject(syserr);
      } else {
        LOG.info(sysout, "standard output from r.js");
        var last = ' * see: http://github.com/requirejs/text for details\n */';
        var data = FS.readFileSync(`${tmpDir}/main-built.js`);
        data = "// Copyright: Ardefact, LLC 2015" + data.toString().substring(data.indexOf(last) + last.length);
        deferred.resolve(data);
      }
    });
  };
  runR();

  return deferred.promise;
};

/**
 * Transform the given files by Babelifying them and overwriting them
 * @param files
 */
var babelTransformFiles = files => {
  var deferred = Q.defer();
  var semaphore = files.length;
  LOG.info("Starting to babelify " + _.size(files) + " files.");
  _.each(files, file => {
    Babel.transformFile(file, {}, (err, data) => {
      if (err) {
        deferred.reject(err);
      } else {
        FS.writeFile(file, data.code, err => {
          if (err) {
            deferred.reject(err);
          } else {
            --semaphore;
            if (semaphore === 0) {
              LOG.info("Finished babelifying.");
              deferred.resolve(files);
            }
          }
        });
      }
    });
  });
  return deferred.promise;
};

/**
 * Prepare static content by
 * 1) Copying appropriate files to a tmpDir.
 * 2) Babelifying the right JS files.
 * 3) Running r.js if requested
 * @param options
 * @param callback
 */
var preProcessStaticContent = options => {
  const staticRoot = options.staticRoot;
  if (!staticRoot) {
    throw "missing staticRoot";
  }
  const minify = Maybe.fromNullable(options.minify).getOrElse(true);
  const tmpFolder = Maybe.fromNullable(options.tmpDir).getOrElse(DEFAULT_TMP_DIR_PATH);

  const excludeRegEx = _.map(Maybe.fromNullable(options.exclude).getOrElse([]), pattern => new RegExp(pattern));
  const doNotBabelify = _.map(Maybe.fromNullable(options.doNotBabelify).getOrElse(DEFAULT_BABEL_EXCLUDE_REGEX), pattern => new RegExp(pattern));

  var matchAny = (file, regexs) => _.any(regexs, regex => regex.test(file));

  var stopWatch = Logging.stopWatch();

  return getAllFiles(staticRoot).then(stopWatch(sec => LOG.info("Got files in " + sec + " seconds"))).then(files => _.filter(files, file => !matchAny(file, excludeRegEx))).then(filteredFiles => copyFiles(filteredFiles, tmpFolder)).then(stopWatch(sec => LOG.info("Copying files took " + sec + " seconds"))).then(copiedFiles => {
    return babelTransformFiles(_.filter(copiedFiles, file => file.endsWith(".js") && !matchAny(file, doNotBabelify))).then(stopWatch(sec => LOG.info("Babel transform took " + sec + " seconds"))).then(() => {
      if (minify) {
        return requireJSConvert(staticRoot, copiedFiles, tmpFolder).then(stopWatch(sec => LOG.info("r.js minification took " + sec + " seconds")));
      } else {
        var done = Q.defer();
        done.resolve(copiedFiles);
        return done.promise;
      }
    });
  });
};

var makeMinifyRouter = options => {
  var deferedRouter = Q.defer();
  const staticRoot = options.staticRoot;
  const headers = options.headers;
  if (!staticRoot || !headers) {
    throw "missing staticRoot or headers";
  }

  var gData = null;
  var serverEtag = null;
  var jsHeaders = _.extend({"Content-Type" : "application/javascript"}, headers);

  var watchedFiles = {};

  var watchFile = file => {
    if (!(file in watchedFiles)) {
      LOG.debug("Now watching " + file);
      FS.watch(Path.resolve(file), event => {
        LOG.info(`path ${file} has been `, event);
        gData = null;
      });
      watchedFiles[file] = true;
    }
  };

  /**
   * Builds static content if it has not been built or needs to be rebuilt.  Otherwise returns gData to callback.
   */
  var buildStaticContent = () => {
    let deferredStaticContent = Q.defer();
    if (gData !== null) {
      deferredStaticContent.resolve(gData);
    } else {
      LOG.info("Rebuilding static content.  This may take a while.....");
      var stopwatch = Logging.stopWatch();
      preProcessStaticContent(options).then(stopwatch(sec => LOG.info("Preprocessing took " + sec + " seconds"))).then(
        postProcessedData => {
          gData = postProcessedData;
          serverEtag = Date.now();
          deferredStaticContent.resolve(gData);
        }, deferredStaticContent.reject);
    }
    return deferredStaticContent.promise;
  };

  var minifyRouter = (req, res, next) => {
    const userEtag = req.headers['if-none-match'];

    buildStaticContent().then(postProcessedStaticData => {
      if (serverEtag == userEtag) {
        res.writeHead(304, jsHeaders);
        var router = (req, res, next) => {
          const userEtag = req.headers['if-none-match'];
          const path = req.path;

          buildStaticContent().then(postProcessedStaticData => {
            if (serverEtag == userEtag) {
              res.writeHead(304, jsHeaders);
              res.end();
            } else {
              res.writeHead(200, _.extend({Etag : serverEtag}, jsHeaders));
              res.end(postProcessedStaticData);
            }
          }, err => {
            res.writeHead(500, headers);
            res.end(JSON.stringify(err));
          });
        };
        res.end();
      } else {
        res.writeHead(200, _.extend({Etag : serverEtag}, jsHeaders));
        res.end(postProcessedStaticData);
      }
    }, err => {
      res.writeHead(500, headers);
      res.end(JSON.stringify(err));
    });
  };

  // build once
  // watch all files
  getAllFiles(staticRoot).then(allFiles=> {
    _.each(allFiles, file => {
      watchFile(file);
      watchFile(Path.dirname(file));
    });
  }).then(buildStaticContent).then(()=>deferedRouter.resolve(minifyRouter), err => deferedRouter.reject(err));

  return deferedRouter.promise;
};

var makeDebugRouter = options => {
  // static debug router.  we just need to babelify js files
  return (req, res, next) =>
    Q.nfcall(Babel.transformFile, `${options.staticRoot}/js/${req.path}`).then(babelOutput => res.end(babelOutput.code),
      error => {
        res.writeHead(500);
        res.end(JSON.stringify(error));
      });

};

module.exports = {
  makeRouter : options => {
    if (options.minify) {
      return makeMinifyRouter(options);
    } else {
      return Q.fcall(() => makeDebugRouter(options));
    }
  },
  _          : {
    preProcessStaticContent : preProcessStaticContent,
    copyFiles               : copyFiles,
    makeTree                : makeTree,
    findCommonRoot          : findCommonRoot
  }
};