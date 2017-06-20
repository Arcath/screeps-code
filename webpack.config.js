const path = require('path')

module.exports = {
  target: 'node',
  entry: './arcai2/main.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main.js'
  }
}
