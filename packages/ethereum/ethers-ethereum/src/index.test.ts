import * as common from "@rarible/ethereum-sdk-test-common"
import { ethers } from "ethers"
import Web3 from "web3"
import type { Ethereum } from "@rarible/ethereum-provider"
import { toAddress } from "@rarible/types"
import { createGanacheProvider } from "@rarible/ethereum-sdk-test-common/build/create-ganache-provider"
import { SeaportABI } from "@rarible/ethereum-sdk-test-common/build/contracts/opensea/test-seaport"
import { parseRequestError } from "@rarible/web3-ethereum/src/utils/parse-request-error"
import { DEV_PK_1 } from "@rarible/ethereum-sdk-test-common"
import { EthersEthereum, EthersTransaction, EthersWeb3ProviderEthereum } from "./index"

const { provider } = createGanacheProvider(DEV_PK_1)
const web3 = new Web3(provider as any)
const web3Provider = new ethers.providers.Web3Provider(provider as any)
const ethereum = new EthersWeb3ProviderEthereum(web3Provider)
const wallet = new ethers.Wallet(DEV_PK_1, web3Provider)
const etheresEthereum = new EthersEthereum(wallet)

const data = [
	ethereum,
	etheresEthereum,
]


describe.each(data)("ethers.js Ethereum", (eth: Ethereum) => {

	test(`${eth.constructor.name} signs typed data correctly`, async () => {
		await common.testTypedSignature(eth)
	})

	test(`${eth.constructor.name} signs personal message correctly`, async () => {
		await common.testPersonalSign(eth)
	})

	test(`${eth.constructor.name} allows to send transactions and call functions`, async () => {
		await common.testSimpleContract(web3, eth)
	})

	test(`${eth.constructor.name} should return balance`, async () => {
		const sender = toAddress(await eth.getFrom())
		expect(await eth.getBalance(sender)).toBeTruthy()
	})

	test(`${eth.constructor.name} getNetworkId`, async () => {
		const networkId = await eth.getChainId()
		expect(networkId).toBe(300500)
	})

	test(`${eth.constructor.name} encode/decode`, async () => {
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

		const encoded = eth.encodeParameter(type,	data)
		const decoded = eth.decodeParameter(type,	encoded)
		for (const field in data) {
			//@ts-ignore
			expect(decoded["data"][field]).toEqual(data[field].toString())
		}
	})

	test(`${eth.constructor.name} getCurrentProvider`, async () => {
		const currentProvider = eth.getCurrentProvider()
		expect(currentProvider).toBe(provider)
	})
})

describe("get transaction receipt events", () => {
	const { provider } = common.createE2eProvider(
		DEV_PK_1,
		{
			networkId: 1,
			rpcUrl: "https://node-mainnet.rarible.com",
		}
	)
	const web3Provider = new ethers.providers.Web3Provider(provider as any)
	const ethereum = new EthersWeb3ProviderEthereum(web3Provider)


	test("get Seaport tx events (prod)", async () => {
		const tx = await ethereum.web3Provider.getTransaction("0x2f81b44332228d78eda5ea48e62134fddd2354713d77f4f61588d91cd7a735ff")
		const signer = web3Provider.getSigner()
		const seaportAddr = "0x00000000006c3852cbef3e08e8df289169ede581"

		const ethersContract = new ethers.Contract(seaportAddr, SeaportABI, signer)
		const ethersTx = new EthersTransaction(tx, ethersContract)
		const events = await ethersTx.getEvents()

		expect(events.find(e => e.event === "OrderFulfilled")).toBeTruthy()
	})

	test("should correctly parse error for invalid method request", async () => {
		let ok = false
		try {
			await ethereum.send("unknown method", [])
			ok = true
		} catch (err) {
			const error = parseRequestError(err)
			expect(error?.code).toEqual(-32601)
		}
		expect(ok).toBeFalsy()
	})
})
