import { merge } from "webpack-merge"
import { baseWebpackConfig } from "./webpack.base"

export const prodWebpackConfig = merge(baseWebpackConfig, {
  mode: "production",
})

// eslint-disable-next-line import/no-default-export
export default prodWebpackConfig
