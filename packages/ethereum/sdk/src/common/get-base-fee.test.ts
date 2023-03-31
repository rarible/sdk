import { configDictionary, getEthereumConfig } from "../config"
import type { EthereumNetwork } from "../types"
import type { EnvFeeType } from "./get-base-fee"
import { getBaseFee } from "./get-base-fee"

describe("get base fee", () => {
	const config = getEthereumConfig("testnet")

	test("get base fee from mainnet", async () => {
	  const fee = await getBaseFee(config, "mainnet")
		expect(fee).not.toBeNaN()
	})

	test("check fees.json config", async () => {
		const configFile = require("../config/fees.json")
		expect(configFile).toBeTruthy()
	})
})

const envs = Object.keys(configDictionary) as EthereumNetwork[]

describe.each(envs)("get balances each of environments", (env: EthereumNetwork) => {
	const config = getEthereumConfig(env)
	const configFile = require("../config/fees.json")

	test(`get base fee from ${env} with master branch`, async () => {
		const fee = await getBaseFee(config, env)
		expect(fee).not.toBeNaN()
	})

	const orderTypes: EnvFeeType[] = [
		"RARIBLE_V1",
		"RARIBLE_V2",
		"OPEN_SEA_V1",
		"SEAPORT_V1",
		"LOOKSRARE",
		"CRYPTO_PUNK",
		"AMM",
		"X2Y2",
		"AUCTION",
	]
	test.each(orderTypes)(`get base fee with env=${env} for type=%s`, async () => {
		for (let type of orderTypes) {
			expect(configFile[env][type]).not.toBeNaN()
		}
	})
})
