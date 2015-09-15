var webpack = require('webpack');


module.exports = {
  entry: './src/dancer',
  output: {
    filename: 'dancer.js',
    libraryTarget: 'umd',
    path: './dist',
  },
  module: {
    loaders: [
      {
        // JS.
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader?cacheDirectory&optional[]=runtime&stage=0',
        test: /\.js$/,
      },
    ],
  },
  resolve: {
    extensions: ['', '.js'],
    modulesDirectories: [
      'src',
      'node_modules',
    ],
  },
};
