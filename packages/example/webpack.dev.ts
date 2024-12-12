import path from "node:path"
import fs from "fs"
import type { Configuration as DevServerConfiguration } from "webpack-dev-server"
import { merge } from "webpack-merge"
import { baseWebpackConfig } from "./webpack.base"

const devServerConfig: DevServerConfiguration = {
  static: {
    directory: path.join(__dirname, "src", "public"),
  },
  compress: true,
  port: 7492,
  // port: 443,
  // server: {
  //   type: "https",
  //   options: {
  //     key: fs.readFileSync(path.join(__dirname, "./test-virtual.mattel.com-key.pem")),
  //     cert: fs.readFileSync(path.join(__dirname, "./test-virtual.mattel.com.pem")),
  // },
  // },
  // allowedHosts: "all", // разрешаем любой хост
  historyApiFallback: true,
}

export const devWebpackConfig = merge(baseWebpackConfig, {
  devServer: devServerConfig,
  mode: "development",
})

// eslint-disable-next-line import/no-default-export
export default devWebpackConfig
