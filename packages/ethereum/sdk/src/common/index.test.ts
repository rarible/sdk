import { configDictionary } from "../config"
import type { EthereumNetwork } from "../types"
import { getBlockchainBySDKNetwork, getBlockchainFromChainId } from "./index"
describe("get blockchain from chain id", () => {
	test("get blockchain from config dictionary", async () => {
		Object.keys(configDictionary)
			.forEach((network) => {
				const config = configDictionary[network as EthereumNetwork]
				expect(getBlockchainFromChainId(config.chainId)).toBeTruthy()
				expect(getBlockchainBySDKNetwork(network as EthereumNetwork)).toBeTruthy()
			})
	})

	test("throw error on getting blockchain with unexpected chainId", async () => {
		expect(() => getBlockchainFromChainId(-1)).toThrow("Config for chainID=-1 has not been found")
	})
})
