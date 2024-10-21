const path = require("path")
const webpack = require("webpack")

module.exports = {
  entry: "./build/index.js",
  output: {
    path: path.resolve(__dirname, "umd"),
    filename: "rarible-sdk.js",
    library: {
      name: "raribleSdk",
      type: "umd",
    },
  },
  resolve: {
    fallback: {
      os: require.resolve("os-browserify/browser"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
      process: require.resolve("process/browser"),
      path: require.resolve("path-browserify"),
      crypto: require.resolve("crypto-browserify"),
      zlib: require.resolve("browserify-zlib"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],
  mode: "production",
  module: {
    rules: [
      {
        test: /\.mjs/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  optimization: {
    minimize: true,
  },
}
