const path = require('path')

module.exports = {
  target: 'node',
  entry: './lib/main.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    './version': './version'
  }
}
