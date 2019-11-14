const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')


const openBrowser = process.argv[3] === '--silence' ? false : true

module.exports = [
  {
    mode: 'development',
    context: __dirname,
    entry: {
      index: [
        './src/script/lib/pixi.js',
        './src/script/lib/gsap/TweenMax.js',
        './src/script/snake.es6'
      ]
    },
    output: {
      path: __dirname + '/dist/',
      filename: './script/[name]-[hash:16].js'
    },
    module: {
      rules: [
        {
          test: function (src) {
            if (
              src.indexOf('script/lib/pixi.js') >= 0 ||
              src.indexOf('script/lib/gsap/TweenMax.js') >= 0
            ) {
              return false
            }
            if (/\.es6$|\.js$/.test(src)) {
              return true
            }
          },
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: 'H5小游戏100例: 贪吃蛇',
        template: './src/snake.html',
        filename: './dist/snake.html',
        inject: true
      }),
      new CopyWebpackPlugin([
        {
          from: './src/css/snake.css',
          to: './dist/css/snake.css'
        },
        {
          from: './src/images/play@2x.png',
          to: './dist/images/play@2x.png'
        },
        {
          from: './src/images/pause@2x.png',
          to: './dist/images/pause@2x.png'
        },
        {
          from: './src/images/switch@2x.png',
          to: './dist/images/switch@2x.png'
        }
      ]),
    ],
    devServer: {
      contentBase: './dist/',
      open: openBrowser,
      openPage: './dist/snake.html'
    },
    watch: true
  }
]
