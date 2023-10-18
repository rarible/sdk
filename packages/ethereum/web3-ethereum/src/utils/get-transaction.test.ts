import * as common from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { getTransaction } from "./get-transaction"

jest.setTimeout(60000)
describe("Get transaction", () => {

	const { provider: providerRarible } = common.createE2eProvider(
		"d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469",
		{
			networkId: 1,
			rpcUrl: "https://node-mainnet.rarible.com",
		}
	)
	const { provider: providerMEW } = common.createE2eProvider(
		"d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469",
		{
			networkId: 1,
			rpcUrl: "https://nodes.mewapi.io/rpc/eth",
		}
	)
	const web3RaribleProvider = new Web3(providerRarible)
	const web3MEWProvider = new Web3(providerMEW)

	test("Get tx with single web3 provider", async () => {
		const tx = await getTransaction(
			"0xaa76e605fe72dd98136cbd48a9d67a47ac9836397ab840205f4f392dae06ae0a",
			{
				web3: web3RaribleProvider,
			}
		)
		expect(tx).toBeTruthy()
	})


	test("Get old tx with two RPC nodes, first node doesn't return result", async () => {
		const tx = await getTransaction(
			"0x8d7ce93eac45141de762bf29fae4a1c6458e2b2d0b0361432b091a9e29b3c903",
			{
				web3: web3RaribleProvider,
				alternateWeb3Instance: web3MEWProvider,
			}
		)
		expect(tx).toBeTruthy()
	})
})
