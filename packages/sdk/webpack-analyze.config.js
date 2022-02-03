const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin
const config = require("./webpack.config")

config.plugins.push(new BundleAnalyzerPlugin())
module.exports = config
