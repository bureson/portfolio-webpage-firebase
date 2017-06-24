var webpack = require("webpack");
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');

var BUILD_DIR = path.resolve(__dirname, "src/client/public");
var APP_DIR = path.resolve(__dirname, "src/client/app");

module.exports = {
  entry: APP_DIR + "/app.jsx",
  output: {
    path: BUILD_DIR,
    filename: "app.bundle.js"
  },
  devServer: {
    port: 8080,
    historyApiFallback: {
      index: 'index.html'
    }
  },
  module: {
    rules: [{
      test: /\.js$/,
      include: APP_DIR,
      exclude: /node_modules/,
      loader: "babel-loader"
    }, {
      test: /\.jsx$/,
      include: APP_DIR,
      exclude: /node_modules/,
      loader: "babel-loader"
    }, {
      test: /\.less$/,
      include: APP_DIR,
      exclude: /node_modules/,
      use: ['css-hot-loader'].concat(ExtractTextPlugin.extract([ 'css-loader', 'less-loader' ]))
    }]
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  plugins: [
    new webpack.ProvidePlugin({ "React": "react"}),
    new ExtractTextPlugin("style.css"),
    new UglifyJSPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
};
