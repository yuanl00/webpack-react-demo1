const path = require('path')
const vueLoaderConfig = require('./vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const utils = require('./utils')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  /**
   * 1. __dirname 为node全局对象，是当前文件所在目录
   * 2. context为 查找entry和部分插件的前置路径
   */
  context: path.resolve(__dirname, '../'),
	entry: {
    /**
     * 入口，chunkname: 路径
     * 多入口可配置多个
     */
    app: ['babel-polyfill', 'react-hot-loader/patch','./src/index.js']
  }, //入口
  output: {// 出口
    path: path.resolve(__dirname, '../dist'),
		filename: 'static/js/[name].[chunkhash].js',
    chunkFilename: 'static/js/[name].[chunkhash].js',
    publicPath: '/'
	}, 
	plugins: [
  ],
  resolve: {
    extensions: ['.js', '.vue', '.json', '.ts', '.jsx'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      'assets': resolve('src/assets'),
      'components': resolve('src/components'),
      // ...
      'store': resolve('src/store')
    }
  },
  // 不打包库
  externals: {
    'vue': 'Vue',
    'vue-router': 'VueRouter',
    'axios': 'axios',
    'vuex': 'Vuex',
    'vant': 'Vant',
    'element-ui': 'ElementUI'
    // 'VueLazyLoad': 'vue-lazyload'
  },
  module: {
    rules: [
      {
        test: /\.(js|vue|ts|tsx|jsx)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src')],
        options: {
          formatter: require('eslint-friendly-formatter'),
          emitWarning: true
        }
      },
      // {
      //   test: /\.vue$/,
      //   /**
      //    * loader配置的几种写法: https://www.bilibili.com/bangumi/play/ss12432
      //    * 单个：loader + options或use: 字符串
      //    * 多个：use/loaders: [string|[]单个]
      //    */
      //   loader: 'vue-loader',
      //   // 包含在.vue文件内的css预处理器配置
      //   options: vueLoaderConfig
      // },
      // {
      //   test:/\.js$/,
      //   use: {
      //     loader: "babel-loader"
      //   },
      //   exclude:/node_modules/
      // },
      {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/, 
        use: [
          {
            loader: 'babel-loader?cacheDirectory=true',
            options:{
              presets: ['@babel/preset-env', '@babel/preset-react']
            },
          }
        ]
      },
      // {
      //   test: /\.js$/,
      //   loader: 'babel-loader?cacheDirectory=true',
      //   exclude: /node_modules/,
      //   include: [resolve('src'), resolve('test')]
      // },
    //   {
    //     test: /\.less$/,     // 解析less
    //     // use: ExtractTextWebpackPlugin.extract({
    //     //     // 将css用link的方式引入就不再需要style-loader了
    //     //     fallback: 'style-loader',
    //     //     use: ['css-loader', 'postcss-loader', 'less-loader'] // 从右向左解析
    //     // })
    //     use: [
    //       process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
    //       'css-loader',
    //       'postcss-loader',
    //       'less-loader'
    //     ]
    // },
      {
        // 末尾\?.*匹配带?资源路径，css字体配置中可能带版本信息
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        /**
         * url-loader
         * 会配合 webpack 对资源引入路径进行复写，如将 css 提取成独立文件，可能出现 404 错误可查看 提取 js 中的 css 部分解决
         * 会以 webpack 的输出路径为基本路径，以 name 配置进行具体输出
         * limit 单位为 byte，小于这个大小的文件会编译为 base64 写进 js 或 html
         */
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(mp4|mp3|wav|webm|ogg|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:7].[ext]',
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/fonts/[name].[hash:7].[ext]',
        }
      }
    ]
  }
}