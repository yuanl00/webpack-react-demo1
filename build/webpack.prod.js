const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpackBaseConfig = require('./webpack.base')
const BundleAnalyzer = require('webpack-bundle-analyzer')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')
// const CompressionWebpackPlugin = require('compression-webpack-plugin')
const merge = require('webpack-merge')
const path = require('path')
const utils = require('./utils')

module.exports = merge(webpackBaseConfig, {
  /**
   * production模式下默认启用这些插件
   * FlagDependencyUsagePlugin, // 应该是删除无用代码的，其他插件依赖
   * FlagIncludedChunksPlugin, // 应该是删除无用代码的，其他插件依赖
   * ModuleConcatenationPlugin,  // 作用域提升
   * NoEmitOnErrorsPlugin,  // 遇到错误代码不跳出
   * OccurrenceOrderPlugin, 
   * SideEffectsFlagPlugin
   * UglifyJsPlugin.  // js代码压缩
   * 
   * process.env.NODE_ENV 的值设为 production
   */
  module: {
    rules: utils.styleLoaders({
      sourceMap: true,
      extract: true,
      usePostCSS: true
    })
  },
  mode: 'production',
  output: {
    /**
     * development下HotModuleReplacement下文件名无法使用hash，
     * 所以将filename与chunkFilename配置从base中拆分到dev与prod中
     */
    filename: 'static/js/[name].[chunkhash:7].js',
    chunkFilename: 'static/js/[name].[chunkhash:7].js'
  },
  performance: {
    hints: false
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: path.join(__dirname, '../dist/index.html'),// 文件写入路径
      template: path.join(__dirname, '../index.html'),// 模板文件路径
      chunks: ['runtime', 'app', 'commons', 'vendors'],  // 将runtime插入html中
      chunksSortMode: 'dependency',
      minify: {/* */},
      inject: true // 插入位置
    }),
    // 开发模式下，会将文件写入内存
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: 'static',
        ignore: ['.*']
      }
    ]),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'static/css/[name].[contenthash:7].css'
    }),
    new InlineManifestWebpackPlugin('runtime'),
    /**
     * https://zhuanlan.zhihu.com/p/35093098
     * https://github.com/pigcan/blog/issues/9
     * vue-cli webpack中也有此配置
     * 正常来讲，引用node_modules不变的话，vender的hash应该是不变的，
     * 但是引用其他的模块，模块id变化会引起vender中模块id变化，引起hash变化，
     * 使用此插件对引入路径进行hash截取最后几位做模块标识可解决这个问题
     * 
     * 开发模式有另一个插件NamedModulesPlugin
     */
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new BundleAnalyzer.BundleAnalyzerPlugin(), // bundle 分析
    // gzip 压缩一般由服务器直接提供
    // new CompressionWebpackPlugin({
    //   asset: '[path].gz[query]',
    //   algorithm: 'gzip',
    //   test: new RegExp(
    //     '\\.(' +
    //     config.build.productionGzipExtensions.join('|') +
    //     ')$'
    //   ),
    //   threshold: 10240,
    //   minRatio: 0.8
    // })
  ],
  /**
   * 优化部分包括代码拆分
   * 且运行时（manifest）的代码拆分提取为了独立的 runtimeChunk 配置 
   */
  optimization: {
    minimizer: [
 // 自定义js优化配置，将会覆盖默认配置
      new UglifyJsPlugin({
        exclude: /\.min\.js$/, // 过滤掉以".min.js"结尾的文件，我们认为这个后缀本身就是已经压缩好的代码，没必要进行二次压缩
        cache: true,
        parallel: true, // 开启并行压缩，充分利用cpu
        sourceMap: false,
        extractComments: false, // 移除注释
        uglifyOptions: {
          compress: {
            unused: true,
            warnings: false,
            drop_debugger: true
          },
          output: {
            comments: false
          }
        }
      }),
      new OptimizeCSSAssetsPlugin({ // css 压缩
        // assetNameRegExp: /\.css$/g,
        cssProcessorOptions: {
          safe: true,
          autoprefixer: { disable: true }, // 这里是个大坑，稍后会提到
          mergeLonghand: false,
          discardComments: {
            removeAll: true // 移除注释
          }
        },
        canPrint: true
      }), 
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          minSize: 30000,
          minChunks: 1,
          chunks: 'initial',
          priority: 1 // 该配置项是设置处理的优先级，数值越大越优先处理
        },
        commons: {
          test: /[\\/]src[\\/]common[\\/]/,
          name: 'commons',
          minSize: 30000,
          minChunks: 3,
          chunks: 'initial',
          priority: -1,
          reuseExistingChunk: true // 这个配置允许我们使用已经存在的代码块
        }
      }
    },
    /**
     * 对应原来的 minchunks: Infinity
     * 提取 webpack 运行时代码
     * 直接置为 true 或设置 name
     */
    runtimeChunk: { // 持久化缓存
      name: 'runtime'
    }
  }
})
