import Web3 from "web3"
import * as common from "@rarible/ethereum-sdk-test-common"
import { SeaportABI } from "@rarible/ethereum-sdk-test-common/build/contracts/opensea/test-seaport"
import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { deployTestContract, SIMPLE_TEST_ABI } from "@rarible/ethereum-sdk-test-common/src/test-contract"
import { DEV_PK_1 } from "@rarible/ethereum-sdk-test-common"
import * as sigUtil from "eth-sig-util"
import { EIP712_ORDER_NAME, EIP712_ORDER_VERSION } from "@rarible/protocol-ethereum-sdk/src/order/eip712"
import { recover } from "@rarible/ethereum-sdk-test-common/build/test-typed-signature"
import { parseRequestError } from "./utils/parse-request-error"
import { Web3Ethereum, Web3FunctionCall, Web3Transaction } from "./index"

describe("Web3Ethereum", () => {
	const { provider } = common.createE2eProvider(DEV_PK_1)
	const web3e2e = new Web3(provider)
	const e2eEthereum = new Web3Ethereum({ web3: web3e2e })
	const { provider: ganache } = common.createGanacheProvider()
	const web3 = new Web3(ganache)
	const ganacheEthereum = new Web3Ethereum({ web3 })

	test("asd", async () => {
		const __msg = {
			"maker": "0x29038b549efbbb795a3dc83c5ef2a7d7682e6a55",
			"type": "RARIBLE_V2",
			"data": {
				"dataType": "RARIBLE_V2_DATA_V2",
				"payouts": [],
				"originFees": [{ "account": "0xa0d586e322616c3a4ad7b5a5fcaeb9ed5e9fe9e0", "value": 300 }],
				"isMakeFill": true,
			},
			"salt": "58083292164850754839539257079261382566271820039696284596179797525977289410067",
			"signature": "0x2e648475565f77647d9c6f477be97251fc6e0945886a3d08412a1bed502530415c81ebae2130d848c7de355202eb24cfdda2292277f6df7f83c7a43e8e6e59481b",
			"end": 1715269004,
			"make": {
				"assetType": {
					"tokenId": "18551088957228879759075475368992614048365334349021829635293421296415359893507",
					"contract": "0xbe3d01e5a918d7e1e94417a268e22e201d4e27ea",
					"assetClass": "ERC1155",
				},
				"value": "100",
			},
			"take": { "assetType": { "assetClass": "ETH" }, "value": "10000000000000000000" },
		}
		const EIP712_ORDER_TYPES = {
			EIP712Domain: [
				{ type: "string", name: "name" },
				{ type: "string", name: "version" },
				{ type: "uint256", name: "chainId" },
				{ type: "address", name: "verifyingContract" },
			],
			AssetType: [
				{ name: "assetClass", type: "bytes4" },
				{ name: "data", type: "bytes" },
			],
			Asset: [
				{ name: "assetType", type: "AssetType" },
				{ name: "value", type: "uint256" },
			],
			Order: [
				{ name: "maker", type: "address" },
				{ name: "makeAsset", type: "Asset" },
				{ name: "taker", type: "address" },
				{ name: "takeAsset", type: "Asset" },
				{ name: "salt", type: "uint256" },
				{ name: "start", type: "uint256" },
				{ name: "end", type: "uint256" },
				{ name: "dataType", type: "bytes4" },
				{ name: "data", type: "bytes" },
			],
		}
		const msg = {
			maker: "0x29038b549efbbb795a3dc83c5ef2a7d7682e6a55",
			// makeAsset: {
			// 	"assetType": {
			// 		"tokenId": "18551088957228879759075475368992614048365334349021829635293421296415359893507",
			// 		"contract": "0xbe3d01e5a918d7e1e94417a268e22e201d4e27ea",
			// 		"assetClass": "ERC1155",
			// 	},
			// 	"value": "100",
			// },
			// taker: ZERO_ADDRESS,
			// takeAsset: {
			// 	"assetType": {
			// 		"assetClass": "ETH",
			// 	},
			// 	"value": "10000000000000000000",
			// },
			// salt: "58083292164850754839539257079261382566271820039696284596179797525977289410067",
			// start: 0,
			// end: 1715269004,
			// dataType: "0x23d235ef",
			// data: e2eEthereum.encodeParameter({
			// 	components: [
			// 		{
			// 			components: [
			// 				{
			// 					name: "account",
			// 					type: "address",
			// 				},
			// 				{
			// 					name: "value",
			// 					type: "uint96",
			// 				},
			// 			],
			// 			name: "payouts",
			// 			type: "tuple[]",
			// 		},
			// 		{
			// 			components: [
			// 				{
			// 					name: "account",
			// 					type: "address",
			// 				},
			// 				{
			// 					name: "value",
			// 					type: "uint96",
			// 				},
			// 			],
			// 			name: "originFees",
			// 			type: "tuple[]",
			// 		},
			// 		{
			// 			name: "isMakeFill",
			// 			type: "bool",
			// 		},
			// 	],
			// 	name: "data",
			// 	type: "tuple",
			// }, {
			// 	"payouts": [],
			// 	"originFees": [{ "account": "0xa0d586e322616c3a4ad7b5a5fcaeb9ed5e9fe9e0", "value": 300 }],
			// 	"isMakeFill": true,
			// }),


			"makeAsset": {
				"assetType": {
					"assetClass": "0x973bb640",
					"data": "0x000000000000000000000000be3d01e5a918d7e1e94417a268e22e201d4e27ea29038b549efbbb795a3dc83c5ef2a7d7682e6a55000000000000000000000003",
				},
				"value": "100",
			},
			"taker": "0x0000000000000000000000000000000000000000",
			"takeAsset": {
				"assetType": {
					"assetClass": "0xaaaebeba",
					"data": "0x",
				},
				"value": "10000000000000000000",
			},
			"salt": "58083292164850754839539257079261382566271820039696284596179797525977289410067",
			start: 0,
			end: 1715269004,
			"dataType": "0x23d235ef",
			"data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a0d586e322616c3a4ad7b5a5fcaeb9ed5e9fe9e0000000000000000000000000000000000000000000000000000000000000012c",
		}
		//@ts-ignore
		const addr = await recover({
			primaryType: "Order",
			domain: {
				name: "Exchange",
				version: "2",
				verifyingContract: "0x6C65a3C3AA67b126e43F86DA85775E0F5e9743F7",
				chainId: 8453,
			},
			types: EIP712_ORDER_TYPES,
			message: msg,
		}, "0x2e648475565f77647d9c6f477be97251fc6e0945886a3d08412a1bed502530415c81ebae2130d848c7de355202eb24cfdda2292277f6df7f83c7a43e8e6e59481b")
		console.log("result addr", addr)
	})

	test("signs typed data correctly", async () => {
		console.log(await e2eEthereum.getFrom())
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

	test("test retrying call/estimateGas with reserve node", async () => {
		const deployed = await deployTestContract(web3e2e)
		const contract = e2eEthereum.createContract(SIMPLE_TEST_ABI, deployed.options.address)
		const tx = await contract.functionCall("setValue", 10).send()
		await tx.wait()

		const originalValue = await contract.functionCall("value").call()
		const originalGas = await contract.functionCall("value").estimateGas()

		const web3Contract = new web3e2e.eth.Contract(SIMPLE_TEST_ABI as any, deployed.options.address)

		const outOfGasMsg = "Returned values aren't valid, did it run Out of Gas? " +
      "You might also see this error if you are not using the correct ABI for the " +
      "contract you are retrieving data from, requesting data from a block number " +
      "that does not exist, or querying a node which is not fully synced."
		web3Contract.methods["value"] = () => {
			return {
				...web3Contract.methods["value"],
				call: () => {
					throw new Error(outOfGasMsg)
				},
				estimateGas: () => {
					throw new Error(outOfGasMsg)
				},
			}
		}

		const fnCall = new Web3FunctionCall(
			{
				web3,
				reserveNodes: {
					300500: "https://dev-ethereum-node.rarible.com",
				},
			},
			web3Contract,
			"value",
			[]
		)

		const value = await fnCall.call()
		expect(value).toBe(originalValue)

		const gas = await fnCall.estimateGas()
		expect(gas).toBe(originalGas)
	})

	test("test retrying call/estimateGas without reserve node is not working", async () => {
		console.log("from", await e2eEthereum.getFrom())
		const deployed = await deployTestContract(web3e2e)
		const contract = e2eEthereum.createContract(SIMPLE_TEST_ABI, deployed.options.address)
		const tx = await contract.functionCall("setValue", 10).send()
		await tx.wait()

		const web3Contract = new web3e2e.eth.Contract(SIMPLE_TEST_ABI as any, deployed.options.address)

		const outOfGasMsg = "Returned values aren't valid, did it run Out of Gas? " +
      "You might also see this error if you are not using the correct ABI for the " +
      "contract you are retrieving data from, requesting data from a block number " +
      "that does not exist, or querying a node which is not fully synced."
		web3Contract.methods["value"] = () => {
			return {
				...web3Contract.methods["value"],
				call: () => {
					throw new Error(outOfGasMsg)
				},
				estimateGas: () => {
					throw new Error(outOfGasMsg)
				},
			}
		}

		const fnCall = new Web3FunctionCall(
			{ web3 },
			web3Contract,
			"value",
			[]
		)

		let callError
		try {
			await fnCall.call()
		} catch (e: any) {
			callError = e.message
		}
		expect(callError.includes(outOfGasMsg)).toBeTruthy()

		let estimateGasError
		try {
			await fnCall.estimateGas()
		} catch (e: any) {
			estimateGasError = e.message
		}
		expect(estimateGasError.includes(outOfGasMsg)).toBeTruthy()
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
