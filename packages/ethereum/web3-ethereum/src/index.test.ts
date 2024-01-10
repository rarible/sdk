import Web3 from "web3"
import * as common from "@rarible/ethereum-sdk-test-common"
import { SeaportABI } from "@rarible/ethereum-sdk-test-common/build/contracts/opensea/test-seaport"
import { toAddress } from "@rarible/types"
import { parseRequestError } from "./utils/parse-request-error"
import { Web3Ethereum, Web3Transaction } from "./index"

describe("Web3Ethereum", () => {
	const { provider } = common.createE2eProvider("d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469")
	const e2eEthereum = new Web3Ethereum({ web3: new Web3(provider) })
	const { provider: ganache } = common.createGanacheProvider()
	const web3 = new Web3(ganache)
	const ganacheEthereum = new Web3Ethereum({ web3 })

	test("signs typed data correctly", async () => {
		await common.testTypedSignature(e2eEthereum)
	})

	test("signs personal message correctly", async () => {
		await common.testPersonalSign(e2eEthereum)
	})

	test("should correctly parse error for invalid method request", async () => {
		let ok = false
		try {
			await e2eEthereum.send("unknown method", [])
			ok = true
		} catch (err) {
			const error = parseRequestError(err)
			expect(error?.code).toEqual(-32601)
		}
		expect(ok).toBeFalsy()
	})

	test("allows to send transactions and call functions", async () => {
		await common.testSimpleContract(web3, ganacheEthereum)
	})

	test("getNetwork", async () => {
		const network = await e2eEthereum.getChainId()
		expect(network).toBe(300500)
	})

	test("encode/decode", async () => {
		const type = {
			components: [
				{
					name: "payouts",
					type: "uint256",
				},
				{
					name: "originFeeFirst",
					type: "uint256",
				},
				{
					name: "marketplaceMarker",
					type: "bytes",
				},
				{
					name: "r",
					type: "uint8",
				},
			],
			name: "data",
			type: "tuple",
		}

		const data = {
			payouts: 0x4058,
			originFeeFirst: 0x1011,
			marketplaceMarker: "0xabcdef",
			r: 78,
		}

		const encoded = e2eEthereum.encodeParameter(type, data)
		const decoded = e2eEthereum.decodeParameter(type, encoded)
		for (const field in data) {
			//@ts-ignore
			expect(decoded["data"][field]).toEqual(data[field].toString())
		}
	})

})

describe("get transaction receipt events", () => {

	const { provider } = common.createE2eProvider(
		"d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469",
		{
			networkId: 1,
			rpcUrl: "https://node-mainnet.rarible.com",
		}
	)
	const e2eEthereum = new Web3Ethereum({ web3: new Web3(provider) })

	test("get Seaport tx events (prod)", async () => {
		const web3 = e2eEthereum.getWeb3Instance()
		const receipt = web3.eth.getTransactionReceipt("0x2f81b44332228d78eda5ea48e62134fddd2354713d77f4f61588d91cd7a735ff")
		const seaportAddr = "0x00000000006c3852cbef3e08e8df289169ede581"

		const tx = new Web3Transaction(
			receipt,
			null as any,
			null as any,
			null as any,
			toAddress(seaportAddr),
			SeaportABI,
		)
		const events = await tx.getEvents()
		expect(events.find(e => e.event === "OrderFulfilled")).toBeTruthy()
	})
})
