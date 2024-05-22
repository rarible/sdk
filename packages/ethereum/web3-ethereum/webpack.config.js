const path = require("path")

module.exports = {
  entry: "./build/index.js",
  output: {
    path: path.resolve(__dirname, "umd"),
    filename: "rarible-web3-ethereum.js",
    library: {
      name: "raribleWeb3Ethereum",
      type: "umd",
    },
  },
  resolve: {
    fallback: {
      stream: require.resolve("stream-browserify"),
      Buffer: require.resolve("buffer"),
      process: require.resolve("process/browser"),
    },
  },
  mode: "production",
  optimization: {
    minimize: true,
  },
}
