'use strict'
process.env.NODE_ENV = 'development'
const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const utils = require('./utils')
const portfinder = require('portfinder')

const devWebpackConfig = merge(baseWebpackConfig, {
  /**
   * development模式下默认启用这些插件
   * NamedChunksPlugin  // 使用entry名做标识
   * NamedModulesPlugin // 使用模块的相对路径非自增id做标识
   * 以上两个模块均为解决hash固化的问题
   */
  module: {
    rules: utils.styleLoaders({ sourceMap: true, usePostCSS: true })
  },
  devtool: 'inline-source-map',
  mode: 'development',
  output: {
    /**
     * HotModuleReplacement下文件名无法使用hash，
     * 所以将filename与chunkFilename配置从base中拆分到dev与prod中
     */
    filename: 'static/[name].js', 
    chunkFilename: 'static/[id].js'
  },
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: true,
    inline: true,
    // 启动热更新
    hot: true,
    // 在页面上全屏输出报错信息
    overlay: {
      warnings: true,
      errors: true
    },
    // 显示进度
    progress: true,
    // dev-server 服务路径
    contentBase: false,
    compress: true,
    host: 'localhost',
    port: '8080',
    open: true,
    quiet: true,
    publicPath: '/',
    proxy: {} // 代理
  },
  optimization: {
    namedModules: true, // 取代插件中的 new webpack.NamedModulesPlugin()
    namedChunks: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new FriendlyErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    /**
     * 对应production下HashedModuleIdsPlugin插件
     * 使用路径做模块标识
     * 因为develop模式下默认使用，不再开启
     */
    // new webpack.NamedModulesPlugin(), 
    new HtmlWebpackPlugin({
      filename: 'index.html', // 文件写入路径，前面的路径与 devServer 中 contentBase 对应
      template: 'index.html',// 模板文件路径
      inject: true
    }),
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || devWebpackConfig.devServer.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        }
      }))

      resolve(devWebpackConfig)
    }
  })
})
