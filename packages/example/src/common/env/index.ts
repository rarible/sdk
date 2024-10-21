import { EnvironmentUtils } from "./utils"

export const environmentUtils = new EnvironmentUtils({
  prod: {
    label: "Production",
    value: "prod",
  },
  development: {
    label: "Development",
    value: "development",
  },
  testnet: {
    label: "Testnet",
    value: "testnet",
  },
})
