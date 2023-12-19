import { configDictionary, getEthereumConfig } from "../config"
import type { EthereumNetwork } from "../types"
import { getBaseFee } from "./get-base-fee"
import { createEthereumApis } from "./apis"
import { getAPIKey } from "./balances.test"
import { delay } from "./retry"

describe("get base fee", () => {
	const config = getEthereumConfig("testnet")

	test("get base fee from mainnet", async () => {
		const env: EthereumNetwork = "mainnet"
		const apis = createEthereumApis(env, { apiKey: getAPIKey(env) })
	  const fee = await getBaseFee(config, env, apis)
		expect(fee).not.toBeNaN()
	})

	test.concurrent("get base fee with error", async () => {
		const env: EthereumNetwork = "mainnet"
		const apis = createEthereumApis(env, { apiKey: getAPIKey(env) })
		apis.orderSettings.getFees = () => { throw new Error("wow") }
	  let feeError: any
		try {
			await getBaseFee(config, env, apis)
		} catch (e) {
			feeError = e
		}
		expect(feeError).toBeTruthy()
		expect(feeError?.message.startsWith("Getting fee error")).toBe(true)
	})

	test("check fees.json config", async () => {
		const configFile = require("../config/fees.json")
		expect(configFile).toBeTruthy()
	})
})

const envs = Object.keys(configDictionary) as EthereumNetwork[]

describe.each(envs)("get base fee each of environments", (env: EthereumNetwork) => {
	const config = getEthereumConfig(env)
	const apis = createEthereumApis(env, { apiKey: getAPIKey(env) })

	afterAll(async () => delay(1000))
	test(`get base fee from ${env}`, async () => {
		const fee = await getBaseFee(config, env, apis)
		expect(fee).not.toBeNaN()
	})
})
