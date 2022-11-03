const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin
const webpack = require("webpack")
const config = require("./webpack.config")

config.plugins = config.plugins.filter((p) => !(p instanceof webpack.optimize.LimitChunkCountPlugin))
config.plugins.push(new BundleAnalyzerPlugin())
module.exports = config
