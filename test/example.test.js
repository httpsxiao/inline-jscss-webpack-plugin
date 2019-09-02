'use strict';

const path = require('path')
const webpack = require('webpack')
const rimraf = require('rimraf')
const fs = require('fs')

jest.setTimeout(30000)

function runExample(exampleName, done) {
  const examplePath = path.resolve(__dirname, '..', 'examples', exampleName)
  const exampleOutput = path.resolve(__dirname, '..', 'examples', 'dist', exampleName)

  rimraf(exampleOutput, ()=> {
    const options = require(path.join(examplePath, 'webpack.config.js'))
    webpack(options, (err, stats) => {
      expect(err).toBeFalsy()
      expect(stats.compilation.errors).toEqual([])

      const res = fs.readFileSync(path.join(exampleOutput, 'example.html'), 'utf-8')
      const expectRes = fs.readFileSync(path.join(examplePath, 'expect.html'), 'utf-8')
      expect(res).toEqual(expectRes)
      done()
      // rimraf(exampleOutput, done)
    })
  })
}

describe('InlineChunksWebpackPlugin Examples', () => {
  it('no-exist example', done => {
    runExample('inline-no-exist', done)
  })
  it('inline-js-css example', done => {
    runExample('inline-js-css', done)
  })
  it('inline-manifest example', done => {
    runExample('inline-manifest', done)
  })
})
