const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('../template/webpack.base.config')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const InlineJscssWebpackPlugin = require('../../lib')

module.exports = merge(baseWebpackConfig, {
  output: {
    path: path.join(__dirname, '..', 'dist', 'inline-manifest')
  },
  optimization: {
    runtimeChunk: {
      name: 'manifest'
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: '../template/example.html',
      filename: 'example.html'
    }),
    new InlineJscssWebpackPlugin({
      assets: ['manifest']
    })
  ]
})
