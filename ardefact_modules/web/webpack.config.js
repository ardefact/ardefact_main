
const path = require('path');

module.exports = {
  entry: "./entry.js",
  output: {
    path: '.',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015']
        }
      }
    ]
  },
  resolve: {
    root: [path.resolve(__dirname + '/../')]
  },
  node: {
    fs: "empty"
  },
};