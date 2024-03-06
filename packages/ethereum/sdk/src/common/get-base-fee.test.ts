import { configDictionary } from "../config"
import type { EthereumNetwork } from "../types"
import { getBaseFee } from "./get-base-fee"
import { createEthereumApis, getApis as getApisTemplate } from "./apis"
import { delay } from "./retry"
import { getAPIKey } from "./test/test-credentials"

/**
 * @group type/common
 */
describe("get base fee", () => {
	test("get base fee from mainnet", async () => {
		const env: EthereumNetwork = "mainnet"
		const getApis = getApisTemplate.bind(null, undefined, env, { apiKey: getAPIKey(env) })
	  const fee = await getBaseFee(env, getApis)
		expect(fee).not.toBeNaN()
	})

	test.concurrent("get base fee with error", async () => {
		const env: EthereumNetwork = "mainnet"
		// const getApis = getApisTemplate.bind(null, null, env, { apiKey: getAPIKey(env) })
		//
		const getApis = async () => {
			const apis = createEthereumApis(env, {})
		  apis.orderSettings.getFees = () => { throw new Error("wow") }
			return apis
		}
	  let feeError: any
		try {
			await getBaseFee(env, getApis)
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

const envs = Object.keys(configDictionary)
	.filter(network => network !== "testnet-lightlink" && network !== "lightlink") as EthereumNetwork[]

describe.each(envs)("get base fee each of environments", (env: EthereumNetwork) => {
	const getApis = async () => {
		return createEthereumApis(env, { apiKey: getAPIKey(env) })
	}

	afterAll(async () => delay(1000))
	test(`get base fee from ${env}`, async () => {
		const fee = await getBaseFee(env, getApis)
		expect(fee).not.toBeNaN()
	})
})
