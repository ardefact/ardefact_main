const path           = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry   : `${__dirname}/entry.js`,
  output  : {
    path          : `${__dirname}/www2`,
    filename      : "bundle.js",
    // export itself to a global var
    libraryTarget : "var",
    // name of the global var: "Foo"
    library       : "JSFuncs"
  },
  module  : {
    loaders : [
      {
        exclude : /node_modules/,
        loader  : 'babel-loader',
        query   : {
          presets : ['react', 'es2015']
        }
      }
    ]
  },
  resolve : {
    root : [path.resolve(__dirname + '/../')]
  },
  node    : {
    fs : "empty"
  },
};
