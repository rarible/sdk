import type { EthereumNetwork } from "../types"
import { ethereumNetworks } from "../types"
import { getBaseFee } from "./get-base-fee"
import { createEthereumApis, getApis as getApisTemplate } from "./apis"
import { getTestAPIKey } from "./test/test-credentials"

/**
 * @group type/common
 */
describe("get base fee", () => {
  test("get base fee from mainnet", async () => {
    const env: EthereumNetwork = "mainnet"
    const getApis = getApisTemplate.bind(null, undefined, env, { apiKey: getTestAPIKey(env) })
    const fee = await getBaseFee(env, getApis)
    expect(fee).not.toBeNaN()
  })

  test.concurrent("get base fee with error", async () => {
    const env = "mainnet" as const

    const getApis = async () => {
      const apis = createEthereumApis(env, {})
      apis.orderSettings.getFees = () => Promise.reject(new Error("wow"))
      return apis
    }

    await expect(() => getBaseFee(env, getApis)).rejects.toBeTruthy()
  })

  test("check fees.json config", async () => {
    const configFile = require("../config/fees.json")
    expect(configFile).toBeTruthy()
  })
})

describe.each(ethereumNetworks)("get base fee each of environments", (env: EthereumNetwork) => {
  const getApis = async () => createEthereumApis(env, { apiKey: getTestAPIKey(env) })

  test(`get base fee from ${env}`, async () => {
    const fee = await getBaseFee(env, getApis)
    expect(fee).not.toBeNaN()
  })
})
