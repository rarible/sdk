import { toAddress, toWord } from "@rarible/types"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { BlockchainEthereumTransaction } from "./"

const networks: EthereumNetwork[] = ["mainnet", "mumbai", "ropsten", "rinkeby", "testnet"]

describe.each(networks)("get ethereum tx link in %s network", network => {
	test("get tx link", () => {
		const tx = new BlockchainEthereumTransaction({
			hash: toWord("0x62b32a0793ab08515c3cdc159430f1ddc62b906b3db809a824571844ba5d459f"),
			from: toAddress("0xccfceecf8451d8cfd1edd0b859c4301f60d3e948"),
			data: "" as any,
			nonce: 0,
			wait: () => Promise.resolve(null as any),
		}, network)

		tx.getTxLink()
	})
})
