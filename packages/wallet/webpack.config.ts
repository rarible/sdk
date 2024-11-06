import path from "node:path"
import type { Configuration } from "webpack"

const webpackConfig: Configuration = {
  mode: "production",
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
      crypto: require.resolve("crypto-browserify"),
      zlib: require.resolve("browserify-zlib"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
    },
  },
  optimization: {
    minimize: true,
  },
}

export default webpackConfig
