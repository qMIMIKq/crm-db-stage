const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin")

const path = require("path")

const mode = process.env.NODE_ENV || "development"
const devMode = mode === "development"

console.log(process.argv)

const target = devMode ? "web" : "browserslist"
const devtool = devMode ? "source-map" : undefined

const polyfill = ["@babel/polyfill"]

module.exports = {
  mode,
  target,
  devtool,
  entry: {
    index: polyfill.concat(path.resolve(__dirname, "web/src/static/js/table", "index.js")),
    login: polyfill.concat(path.resolve(__dirname, "web/src/static/js/login", "login.js")),
    report: polyfill.concat(path.resolve(__dirname, "web/src/static/js/report", "report.js")),
    timeReport: polyfill.concat(path.resolve(__dirname, "web/src/static/js/timeReport", "timeReport.js")),
    plan: polyfill.concat(path.resolve(__dirname, "web/src/static/js/plan", "plan.js")),
  },
  output: {
    path: path.resolve("web/dist"),
    clean: true,
    filename: `${devMode ? "static/js/[name].js" : "static/js/[name].[fullhash].js"}`,
    // filename: "static/js/[name].[fullcontenthash].js",
    assetModuleFilename: "static/assets/[name]/[name][ext]"
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "templates/main/index.html",
      template: path.resolve("web", "src/templates/main/index.html"),
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      filename: "templates/login/login.html",
      template: path.resolve("web", "src/templates/login/login.html"),
      chunks: ["login"]
    }),
    new HtmlWebpackPlugin({
      filename: "templates/report/report.html",
      template: path.resolve("web", "src/templates/report/report.html"),
      chunks: ["report"]
    }),
    new HtmlWebpackPlugin({
      filename: "templates/timeReport/timeReport.html",
      template: path.resolve("web", "src/templates/timeReport/timeReport.html"),
      chunks: ["timeReport"]
    }),
    new HtmlWebpackPlugin({
      filename: "templates/plan/plan.html",
      template: path.resolve("web", "src/templates/plan/plan.html"),
      chunks: ["plan"]
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: `${devMode ? "static/css/[name].css" : "static/css/[name].[fullhash].css"}`
    }),
  ],
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.(c|sc|sa)ss$/i,
        use: [
          devMode ? "style-loader" :
            MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [require("postcss-preset-env")]
              }
            }
          },
          "sass-loader",
        ],
      },
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {targets: "defaults"}]
            ]
          }
        }
      },
      {
        test: /\.(jpe?g|png|webp|gif|svg)$/i,
        type: "asset/resource",
      }
    ]
  }
}