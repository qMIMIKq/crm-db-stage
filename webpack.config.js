const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin")

const path = require("path")

const mode = process.env.NODE_ENV || "development"
const devMode = mode === "development"

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
    },
    output: {
        path: path.resolve(__dirname, "web/dist"),
        clean: true,
        filename: "static/js/[name].js",
        assetModuleFilename: "static/css/[name]/[name][ext]"
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "templates/main/index.html",
            template: path.resolve(__dirname, "web", "src/templates/main/index.html"),
            chunks: ["index"]
        }),
        new HtmlWebpackPlugin({
            filename: "templates/login/login.html",
            template: path.resolve(__dirname, "web", "src/templates/login/login.html"),
            chunks: ["login"]
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: "static/css/[name].[contenthash].css"
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
                    devMode ? "style-loader" : MiniCssExtractPlugin.loader,
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