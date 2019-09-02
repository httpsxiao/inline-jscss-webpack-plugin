const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  context: __dirname,
  entry: {
    example: './example.js'
  },
  output: {
    publicPath: '',
    filename: '[name].[chunkhash:6].js'
  },
  module: {
    rules: [
      { test: /\.css$/, use: [ MiniCssExtractPlugin.loader, 'css-loader' ] }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: '[name].[contenthash:6].css' })
  ]
}
