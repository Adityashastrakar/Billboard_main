const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry:  path.join(__dirname, 'src', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  resolve: {
    fallback: {
      "crypto": false,
      "zlib": false,
      "buffer": false,
      "url": false,
      "stream": false,
      "timers": false,
      "querystring": false,
      "http": false,
      fs: false,
      net:false,
      tls:false,
      "os": false
    }
  },
  externals: {
    express: 'express',
  },
  performance : {
    hints : false
}  
};
