const path = require("path")

module.exports = {
  entry: "./build/index.js",
  output: {
    path: path.resolve(__dirname, "umd"),
    filename: "rarible-wallet-sdk.js",
    library: {
      name: "raribleWalletSdk",
      type: "umd",
    },
  },
  resolve: {
    fallback: {
      stream: require.resolve("stream-browserify"),
    },
  },
  mode: "production",
  optimization: {
    minimize: true,
  },
}
