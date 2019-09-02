# inline-jscss-webpack-plugin

基于 `webpack` 和 `html-webpack-plugin` 的插件，将 `js`|`css` 链接对应内容打入 `html`

### Installation

`npm install --save-dev inline-jscss-webpack-plugin`

### Usage

```javascript
  // webpack.conf.js

  const HtmlWebpackPlugin = require('html-webpack-plugin')
  const InlineJscssWebpackPlugin = require('inline-jscss-webpack-plugin')

  const webpackConfig = {
    entry: {
      example: './example.js'
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new InlineJscssWebpackPlugin({
        assets: [
          'manifest.js', // 会打入 manifest.[hash.]js
          'example' // 会打入 example.[hash.]js 和 example.[hash.]css
        ]
      })
    ]
  }

  module.exports = webpackConfig
```

### options

|参数名称|类型|含义|是否必填|默认值|
|:-----:|:-----:|:-----:|:-----:|:-----:|
| assets | Array[string] | 要打入 html 中的所有 js&css 文件 | 否 | [] |
| delete | Boolean | 是否删除已经打入的文件 | 否 | false |
