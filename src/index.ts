import { Compiler, compilation as CompilationType } from 'webpack'
import { AsyncSeriesWaterfallHook } from 'tapable'
import HtmlWebpackPlugin from 'html-webpack-plugin'

declare namespace inlineJscssWebpackPlugin {
  export type CompilationHooks = CompilationType.CompilationHooks
  export interface Options {
    assets: string[],
    delete: boolean
  }

  export interface AddHtml extends CompilationHooks {
    htmlWebpackPluginAlterAssetTags: AsyncSeriesWaterfallHook
  }
}

class inlineJscssWebpackPlugin {
  private readonly assets: string[]
  private readonly delete: boolean
  private readonly innerRegex = /[#@] sourceMappingURL=([^\s'"]*)/
  private readonly regex = RegExp(
    '(?:' +
      '/\\*' +
      '(?:\\s*\r?\n(?://)?)?' +
      '(?:' + this.innerRegex.source + ')' +
      '\\s*' +
      '\\*/' +
      '|' +
      "//(?:" + this.innerRegex.source + ')' +
    ')' +
    '\\s*'
  )

  constructor(options: Partial<inlineJscssWebpackPlugin.Options> = {}) {
    this.assets = options.assets || []
    this.delete = options.delete || false
  }

  public apply(compiler: Compiler): void {
    if (compiler.hooks) {
      compiler.hooks.compilation.tap('inlineJscssWebpackPlugin', (compilation: CompilationType.Compilation) => {
        if ((HtmlWebpackPlugin as any).getHooks) {
          // html-webpack-plugin >= 4
          (HtmlWebpackPlugin as any).getHooks(compilation).alterAssetTags.tapAsync(
            'inlineJscssWebpackPlugin',
            (htmlPluginData: any, callback: any) => {
              this.process(compilation, htmlPluginData, callback)
            }
          )
        } else {
          // html-webpack-plugin <= 3
          (compilation.hooks as inlineJscssWebpackPlugin.AddHtml).htmlWebpackPluginAlterAssetTags.tapAsync(
            'inlineJscssWebpackPlugin',
            (htmlPluginData: any, callback: any) => {
              this.process(compilation, htmlPluginData, callback)
            }
          )
        }
      })
    } else {
      compiler.plugin('compilation', (compilation: CompilationType.Compilation) => {
        compilation.plugin('html-webpack-plugin-alter-asset-tags', (htmlPluginData: any[], callback) => {
          this.process(compilation, htmlPluginData, callback)
        })
      })
    }
  }

  private process(
    compilation: CompilationType.Compilation,
    htmlPluginData: any[],
    callback: any
  ): void {
    this.assets.forEach(asset => this.processOne(compilation, htmlPluginData, asset))
    callback(null, htmlPluginData)
  }

  private processOne(
    compilation: CompilationType.Compilation,
    htmlPluginData: any,
    asset: string
  ): void {
    const [assetName = '', assetExt = ''] = asset.split('.')
    const isJs = assetExt === 'js' || assetExt === ''
    const isCss = assetExt === 'css' || assetExt === ''
    const jsRegExp = new RegExp(`${assetName}\\..*js`)
    const cssRegExp = new RegExp(`${assetName}\\..*css`)
    const allTag = htmlPluginData.body
                    ? htmlPluginData.body.concat(htmlPluginData.head)
                    : htmlPluginData.assetTags.scripts.concat(htmlPluginData.assetTags.styles)

    allTag.forEach((tag: any) => {
      // process js
      if (
        tag.tagName === 'script' &&
        isJs &&
        tag.attributes &&
        jsRegExp.test(tag.attributes.src)
      ) {
        const compilationAssetsKeys = Object.keys(compilation.assets)
        for (let i = 0; i < compilationAssetsKeys.length; i++) {
          const key = compilationAssetsKeys[i]

          if (jsRegExp.test(key)) {
            delete tag.attributes.src
            tag.innerHTML = this.sourceMappingRemove(compilation.assets[key].source())
            if (this.delete) { delete compilation.assets[key] }
            break
          }
        }
      }
      // process css
      if (
          tag.tagName === 'link' &&
          isCss &&
          tag.attributes &&
          cssRegExp.test(tag.attributes.href)
      ) {
        const compilationAssetsKeys = Object.keys(compilation.assets)

        for (let i = 0; i < compilationAssetsKeys.length; i++) {
          const key = compilationAssetsKeys[i]

          if (cssRegExp.test(key)) {
            tag.tagName = 'style'
            tag.closeTag = true
            tag.attributes.type = 'text/css'
            delete tag.voidTag
            delete tag.attributes.href
            delete tag.attributes.rel
            tag.innerHTML = this.sourceMappingRemove(compilation.assets[key].source())
            if (this.delete) { delete compilation.assets[key] }
            break
          }
        }
      }
    })
  }
  private sourceMappingRemove(code: string): string {
    return code.replace(this.regex, '')
  }
}

export = inlineJscssWebpackPlugin
