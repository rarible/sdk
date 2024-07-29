import path from "node:path"
import NodePolyfillPlugin from "node-polyfill-webpack-plugin"
import DotEnvPlugin from "dotenv-webpack"
import HtmlWebpackPlugin from "html-webpack-plugin"
import type { Configuration } from "webpack"

export const baseWebpackConfig: Configuration = {
  target: "web",
  entry: path.join(__dirname, "src", "index.tsx"),
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "index.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader", // for styles
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "index.html"),
      publicPath: "/",
    }),
    new DotEnvPlugin(),
    new NodePolyfillPlugin(),
  ],
}

// eslint-disable-next-line import/no-default-export
export default baseWebpackConfig
