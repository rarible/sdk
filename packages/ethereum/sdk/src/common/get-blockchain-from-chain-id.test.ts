import { configDictionary } from "../config"
import type { EthereumNetwork } from "../types"
import { getBlockchainFromChainId } from "./get-blockchain-from-chain-id"

describe("get blockchain from chain id", () => {
	test("get blockchain from config dictionary", async () => {
		Object.keys(configDictionary)
			.forEach((network) => {
				const config = configDictionary[network as EthereumNetwork]
				expect(getBlockchainFromChainId(config.chainId)).toBeTruthy()
			})
	})

	test("throw error on getting blockchain with unexpected chainId", async () => {
		expect(() => getBlockchainFromChainId(-1)).toThrow("ChainID from config could not be recognized")
	})
})
