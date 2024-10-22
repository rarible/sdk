const path = require("path")

module.exports = {
  entry: "./build/index.js",
  output: {
    path: path.resolve(__dirname, "umd"),
    filename: "rarible-ethereum-sdk.js",
    library: {
      name: "raribleEthereumSdk",
      type: "umd",
    },
  },
  resolve: {
    fallback: {
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
      process: require.resolve("process/browser"),
    },
  },
  mode: "production",
  optimization: {
    minimize: true,
  },
}
