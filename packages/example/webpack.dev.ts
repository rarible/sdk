import path from "node:path"
import type { Configuration as DevServerConfiguration } from "webpack-dev-server"
import { merge } from "webpack-merge"
import { baseWebpackConfig } from "./webpack.base"

const devServerConfig: DevServerConfiguration = {
  static: {
    directory: path.join(__dirname, "src", "public"),
  },
  compress: true,
  port: 9000,
  historyApiFallback: true,
}

export const devWebpackConfig = merge(baseWebpackConfig, {
  devServer: devServerConfig,
  mode: "development",
})

// eslint-disable-next-line import/no-default-export
export default devWebpackConfig
