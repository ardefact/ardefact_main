/**
 *
 */
'use strict';

var LOG = require('./../../../../Logging').createLogger(__filename);

var FS         = require('fs-extra'),
    Exec       = require('child_process'),
    Maybe      = require('data.maybe'),
    Babel      = require('babel-core'),
    Path       = require('path'),
    Q          = require('q'),
    _          = require('lodash'),
    Handlebars = require('handlebars'),
    Logging    = require('./../../../../Logging'),
    Config     = require('./../Config');

const DEFAULT_TMP_DIR_PATH = '../../tmp';

const DEFAULT_BABEL_EXCLUDE_REGEX = [
  ".*bower_components.*"
];

var makeTree = files => {
  
  var Node = function (fullpath, name) {
    this.fullpath = fullpath;
    this.name = name ? name : "";
    this.children = {};
    this.parent = null;
    this.stats = null;
    
    this.toString = () => {
      var childrenStr = "";
      _.each(this.children, (val, key) => {
        childrenStr += val.toString();
      });
      return `${this.fullpath}:${_.size(this.children)}:${JSON.stringify(this.stats)}\n${childrenStr}`;
    }
  };

  var root = new Node("/", "/");
  
  var insertIntoTree = path => {
    var promises = [];
    const parts = path.split(Path.sep);
    var walker = root;
    var pathPart = "";
    _.each(parts, part => {
      pathPart += Path.sep + part;
      var node = walker.children[part];
      if (!node) {
        node = walker.children[part] = new Node(Path.resolve(pathPart), part);
        node.parent = walker;
        var node2 = node;
        promises.push(Q.nfcall(FS.stat, path).then(stats => node2.stats = stats));
      }
      walker = node;
    });
    return Q.all(promises);
  };

  return Q.all(_.map(files, insertIntoTree)).then(() => root);
};

var findCommonRoot = rootNode => {
  LOG.info(rootNode.toString());
  var walker = rootNode;
  while (true) {
    const numChildren = _.size(walker.children);
    if (numChildren > 1) {
      break;
    }
    const nextNode = walker.children[_.keys(walker.children)[0]];
    if (nextNode === null || nextNode === undefined) {
      break;
    }
    walker = nextNode;
  }
  return walker.stats.isFile() ? walker.parent.fullpath : walker.fullpath;
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

var copyFiles = (staticRoot, originalFiles, tmpRootFolder, _callback) => {
  LOG.info(`Copying ${_.size(originalFiles)} files into ${tmpRootFolder}`);
  var deferred = Q.defer();

//  makeTree(originalFiles)
 //  .then(findCommonRoot)
//   .then(Logging.debug(LOG, "Common root"))
   (originalRoot => {
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
  })(staticRoot);

  return deferred.promise;
};

var requireJSConvert = (requireJsConfig, tmpDir) => {
  var deferred = Q.defer();

  // function to run r.js
  var runR = () => {
    var rOptions = _.extend({
      name    : "main",
      out     : Path.resolve(`${tmpDir}/main-built.js`)
    }, requireJsConfig);

    var configData = JSON.stringify(rOptions);
    configData = `(${configData})`;
    const rbuildJsonPath = Path.resolve(tmpDir + "/js/rbuild.json");
    FS.writeFileSync(rbuildJsonPath, configData);
    var tmpPath = Path.resolve(tmpDir + "/js");
    var rJsPath = Config.rPath;
    var cmd = `cd "${tmpPath}";  ${rJsPath} -o ${rbuildJsonPath}`;
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
  if (semaphore === 0) {
    deferred.resolve(files);
  }
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
 * 
 * @param sourceFile
 * @param options
 * @returns Promise with the output of handlebar
 */
var handleBarIt = (sourceFile, options) => {
  return Q.nfcall(FS.readFile, sourceFile)
          .then(stuff => Handlebars.compile(stuff.toString())(options)).then(x=>x, error => {
      LOG.error(error, "couldn't handlebar " + sourceFile);
      return error;
    });
};

/**
 * Assumes file was already copied and such
 * @param file
 */
const postProcessfile = file => {
  
};

const getCSS = (staticRoot) => {
  var ret = "";
  ret += FS.readFileSync(Path.resolve(`${staticRoot}/css/reset.css`)).toString() + "\n\n\n";
  ret += FS.readFileSync(Path.resolve(`${staticRoot}/css/index_dark.css`)).toString();
  
  return ret;
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

  const includeRegex = _.map(Maybe.fromNullable(options.include).getOrElse([]), pattern => new RegExp(pattern));
  const excludeRegEx = _.map(Maybe.fromNullable(options.exclude).getOrElse([]), pattern => new RegExp(pattern));
  const doNotBabelify = _.map(Maybe.fromNullable(options.doNotBabelify).getOrElse(DEFAULT_BABEL_EXCLUDE_REGEX), pattern => new RegExp(pattern));
  
  LOG.debug(excludeRegEx, "Exclude regexes");
  LOG.debug(includeRegex, "Include regexes");
  LOG.debug(doNotBabelify, "Do not babelify regexes");

  var matchAny = (file, regexs) => _.any(regexs, regex => regex.test(file));

  var stopWatch = Logging.stopWatch();

  return getAllFiles(staticRoot)
    .then(stopWatch(sec => LOG.info("Got files in " + sec + " seconds.")))
    .then(files => _.filter(files, file => !matchAny(file, excludeRegEx)))
    .then(files => _.filter(files, file => includeRegex.length === 0 ? true : matchAny(file, includeRegex)))
    .then(stopWatch(sec => LOG.info(`Filtered files in ${sec} seconds.`)))
    .then(filteredFiles => copyFiles(staticRoot, filteredFiles, tmpFolder))
    .then(stopWatch(sec => LOG.info(`Copying files took ${sec} seconds`)))
    .then(
      copiedFiles => {
        // handle bar appropriate files then babel transform them
        return Q.all(_.map(_.filter(copiedFiles, file => !file.endsWith("index.html") && (file.endsWith(".css") || file.endsWith(".js") || file.endsWith(".html")) && !matchAny(file, doNotBabelify)), file => handleBarIt(file, options.handleBarOptions)
          .then(templated => FS.writeFileSync(file, templated))))      
         .then(stopWatch(sec => LOG.info(`Handlebarring took ${sec} seconds`)))
         .then(
           () => {
             return babelTransformFiles(_.filter(copiedFiles, file => file.endsWith(".js") && !matchAny(file, doNotBabelify)))
               .then(stopWatch(sec => LOG.info("Babel transform took " + sec + " seconds")))
               .then(
                 () => {
                   if (minify) {
                     return requireJSConvert(require(`${staticRoot}/js/main`), tmpFolder)
                       .then(stopWatch(sec => LOG.info("r.js minification took " + sec + " seconds")));
                   } else {
                     var done = Q.defer();
                     done.resolve(copiedFiles);
                     return done.promise;
                   }
                 });
           })
          .then(minifiedStuff => {
            const indexFile = Path.resolve(`${tmpFolder}/index.html`);
            handleBarIt(indexFile, _.extend(
              {
                cssReset : FS.readFileSync(Path.resolve(`${tmpFolder}/css/reset.css`)).toString(),
                cssArdefact: FS.readFileSync(Path.resolve(`${tmpFolder}/css/index_dark.css`)).toString(),
                requireJS: FS.readFileSync(Path.resolve(`${staticRoot}/js/lib/require.js`)).toString(),
                ardefactMainJS: options.minify ? minifiedStuff : FS.readFileSync(Path.resolve(`${tmpFolder}/js/main.js`)).toString(),
                ardefactGoogleMapsJS: FS.readFileSync(Path.resolve(`${tmpFolder}/js/google_maps.js`)).toString()
              },
              options.handleBarOptions
            ))
              .then(indexHandlebarred => FS.writeFileSync(indexFile, indexHandlebarred));
          });
      });
};

var makeMinifyRouter = options => {
  var deferedRouter = Q.defer();
  const staticRoot = options.staticRoot;
  const headers = options.headers;

  var gData = null;
  var serverEtag = null;
  var jsHeaders = _.extend({"Content-Type" : "application/javascript"}, headers);

  var watchedFiles = {};

  var watchFile = file => {
    if (!(watchedFiles[file])) {
      LOG.debug("Now watching " + file);
      FS.watch(Path.resolve(file), event => {
        LOG.info(`path ${file} has been `, event);
        gData = null;
        watchedFiles[file] = false;
        watchFile(file);
      });
      watchedFiles[file] = true;
    }
  };

  /**
   * Builds static content if it has not been built or needs to be rebuilt.  Otherwise returns gData to callback.
   */
  var buildStaticContent = () => {
    const deferredStaticContent = Q.defer();
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
    
    buildStaticContent().then(next());

    /*
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
    */
  };

  // build once
  // watch all files
  getAllFiles(staticRoot)
    .then(allFiles=> {
      _.each(allFiles, file => {
        watchFile(file);
        watchFile(Path.dirname(file));
    });
  })
    .then(buildStaticContent)
    .then(()=>deferedRouter.resolve(minifyRouter), err => deferedRouter.reject(err));

  return deferedRouter.promise;
};



var makeDebugRouter = options => {
  // static debug router.  we just need to babelify js files
  
  var needToPreprocess = true;

  var changedFiles = {};
  var watchedFiles = {};
  var watchFile = file => {
    if (!(watchedFiles[file])) {
      const fileName = Path.resolve(file);
      FS.watch(fileName, event => {
        LOG.debug(`path ${file} has been `, event);
        needToPreprocess = true;
        changedFiles[fileName] = true;
        
        watchedFiles[file] = false;
        watchFile(file);
      });
      watchedFiles[file] = true;
    }
  };
  
  var preProcessDebug = () => {
    if (!needToPreprocess) {
      const deferred = Q.defer();
      deferred.resolve();
      return deferred.promise;
    } else {
      return getAllFiles(options.staticRoot)
        .then(files => {
          _.each(files, watchFile);
          return files;
        })
        .then(files => preProcessStaticContent(_.extend({include: _.keys(changedFiles)}, options)))
        .then(() => {
          needToPreprocess = false;
          changedFiles = {};
        });
      }
  };

  return (req, res, next) => {
      preProcessDebug().then(() => {
        next();
    }).then(null, error => {
      LOG.error(error, "Couldn't serve stuff....");
    }).done();
  }
};

module.exports = {
  makeRouter : options => {
    if (!options.staticRoot || !options.headers) {
      throw "missing staticRoot or headers";
    }
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