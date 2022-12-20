import { awaitAll, createE2eProvider, deployTestErc20 } from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { sentTx } from "@rarible/protocol-ethereum-sdk/build/common/send-transaction"
import { toAddress, toContractAddress, toCurrencyId, toItemId, toOrderId, toWord } from "@rarible/types"
import Web3 from "web3"
import { Blockchain, BlockchainGroup } from "@rarible/api-client"
import { id32 } from "@rarible/protocol-ethereum-sdk/build/common/id"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { MintType } from "../../types/nft/mint/prepare"
import { awaitForOwnership } from "../tezos/test/await-for-ownership"
import { awaitItem } from "../../common/test/await-item"
import { awaitStock } from "../../common/test/await-stock"
import { OriginFeeSupport } from "../../types/order/fill/domain"
import { initProviders } from "./test/init-providers"
import { convertEthereumCollectionId, convertEthereumToUnionAddress } from "./common"
import { DEV_PK_1, DEV_PK_2 } from "./test/common"

describe("sale", () => {
	const { web31, web32, wallet1, wallet2 } = initProviders({ pk1: DEV_PK_1, pk2: DEV_PK_2 })
	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const ethereum2 = new Web3Ethereum({ web3: web32 })
	const sdk1 = createRaribleSdk(new EthereumWallet(ethereum1), "development", { logs: LogsLevel.DISABLED })
	const sdk2 = createRaribleSdk(new EthereumWallet(ethereum2), "development", {
		logs: LogsLevel.DISABLED,
		blockchain: {
			[BlockchainGroup.ETHEREUM]: {
				marketplaceMarker: "0x000000000000000000000000000000000000000000000009",
			},
		},
	})

	const erc721Address = toAddress("0x64F088254d7EDE5dd6208639aaBf3614C80D396d")

	const conf = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
	})

	test("erc721 sell/buy using erc-20", async () => {
		const wallet1Address = wallet1.getAddressString()
		const wallet2Address = wallet2.getAddressString()

		await sentTx(
			conf.testErc20.methods.mint(wallet2Address, "1000000000"),
			{ from: wallet1Address, gas: 200000 }
		)
		const action = await sdk1.nft.mint.prepare({
			collectionId: convertEthereumCollectionId(erc721Address, Blockchain.ETHEREUM),
		})
		const result = await action.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumToUnionAddress(wallet1Address, Blockchain.ETHEREUM),
				value: 10000,
			}],
			royalties: [],
			lazyMint: false,
			supply: 1,
		})
		if (result.type === MintType.ON_CHAIN) {
			await result.transaction.wait()
		}

		await awaitItem(sdk1, result.itemId)

		const sellAction = await sdk1.order.sell.prepare({ itemId: result.itemId })
		const orderId = await sellAction.submit({
			amount: 1,
			price: "0.000000000000000002",
			currency: {
				"@type": "ERC20",
				contract: toContractAddress(`ETHEREUM:${conf.testErc20.options.address}`),
			},
			expirationDate: new Date(Date.now() + 200000),
		})

		const nextStock = "1"
		const order = await awaitStock(sdk1, orderId, nextStock)
		expect(order.makeStock.toString()).toEqual(nextStock)

		const updateAction = await sdk1.order.sellUpdate.prepare({ orderId })
		await updateAction.submit({ price: "0.000000000000000001" })

		await sdk1.apis.order.getOrderById({ id: orderId })

		const fillAction = await sdk2.order.buy.prepare({ orderId })

		const tx = await fillAction.submit({ amount: 1 })
		console.log("tx.transaction.data", tx.transaction.data)
		// expect()
		await tx.wait()

		const nextStock2 = "0"
		const order2 = await awaitStock(sdk1, orderId, nextStock2)
		expect(order2.makeStock.toString()).toEqual(nextStock2)
	})

	test("erc721 sell/buy using erc-20 with calldata", async () => {
		const wallet1Address = wallet1.getAddressString()
		const wallet2Address = wallet2.getAddressString()

		await sentTx(
			conf.testErc20.methods.mint(wallet2Address, "1000000000"),
			{ from: wallet1Address, gas: 200000 }
		)
		const action = await sdk1.nft.mint.prepare({
			collectionId: convertEthereumCollectionId(erc721Address, Blockchain.ETHEREUM),
		})
		const result = await action.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumToUnionAddress(wallet1Address, Blockchain.ETHEREUM),
				value: 10000,
			}],
			royalties: [],
			lazyMint: false,
			supply: 1,
		})
		if (result.type === MintType.ON_CHAIN) {
			await result.transaction.wait()
		}

		await awaitItem(sdk1, result.itemId)

		const sellAction = await sdk1.order.sell.prepare({ itemId: result.itemId })
		const orderId = await sellAction.submit({
			amount: 1,
			price: "0.000000000000000002",
			currency: {
				"@type": "ERC20",
				contract: toContractAddress(`ETHEREUM:${conf.testErc20.options.address}`),
			},
			expirationDate: new Date(Date.now() + 200000),
		})

		const nextStock = "1"
		const order = await awaitStock(sdk1, orderId, nextStock)
		expect(order.makeStock.toString()).toEqual(nextStock)

		const fillAction = await sdk2.order.buy.prepare({ orderId })

		const tx = await fillAction.submit({ amount: 1 })
		await tx.wait()

		const nextStock2 = "0"
		const order2 = await awaitStock(sdk1, orderId, nextStock2)
		expect(order2.makeStock.toString()).toEqual(nextStock2)
		expect(tx.transaction.data.endsWith("00000000000000000000000000000000000000000000000909616c6c64617461")).toBe(true)
	})

	test("erc721 sell/buy using erc-20 with order object", async () => {
		const wallet1Address = wallet1.getAddressString()
		const wallet2Address = wallet2.getAddressString()

		const action = await sdk1.nft.mint.prepare({
			collectionId: convertEthereumCollectionId(erc721Address, Blockchain.ETHEREUM),
		})
		const result = await action.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumToUnionAddress(wallet1Address, Blockchain.ETHEREUM),
				value: 10000,
			}],
			royalties: [],
			lazyMint: false,
			supply: 1,
		})
		if (result.type === MintType.ON_CHAIN) {
			await result.transaction.wait()
		}
		await sentTx(
			conf.testErc20.methods.mint(wallet2Address, 100),
			{ from: wallet1Address, gas: 200000 }
		)

		await awaitItem(sdk1, result.itemId)

		const sellAction = await sdk1.order.sell.prepare({ itemId: result.itemId })
		const orderId = await sellAction.submit({
			amount: 1,
			price: "0.000000000000000002",
			currency: {
				"@type": "ERC20",
				contract: toContractAddress(`ETHEREUM:${conf.testErc20.options.address}`),
			},
		})

		const nextStock = "1"
		const order = await awaitStock(sdk1, orderId, nextStock)
		expect(order.makeStock.toString()).toEqual(nextStock)

		const fillAction = await sdk2.order.buy.prepare({ order })

		const tx = await fillAction.submit({ amount: 1 })
		await tx.wait()

		const nextStock2 = "0"
		const order2 = await awaitStock(sdk1, orderId, nextStock2)
		expect(order2.makeStock.toString()).toEqual(nextStock2)
	})

	test.skip("erc721 sell/buy using erc-20 throw error with outdated expiration date", async () => {
		const wallet1Address = wallet1.getAddressString()
		const wallet2Address = wallet2.getAddressString()
		await sentTx(
			conf.testErc20.methods.mint(wallet2Address, 100),
			{ from: wallet1Address, gas: 200000 }
		)
		const action = await sdk1.nft.mint.prepare({
			collectionId: convertEthereumCollectionId(erc721Address, Blockchain.ETHEREUM),
		})
		const result = await action.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumToUnionAddress(wallet1Address, Blockchain.ETHEREUM),
				value: 10000,
			}],
			royalties: [],
			lazyMint: false,
			supply: 1,
		})
		if (result.type === MintType.ON_CHAIN) {
			await result.transaction.wait()
		}

		await awaitItem(sdk1, result.itemId)

		const sellAction = await sdk1.order.sell.prepare({ itemId: result.itemId })
		const orderId = await sellAction.submit({
			amount: 1,
			price: "0.000000000000000002",
			currency: {
				"@type": "ERC20",
				contract: toContractAddress(`ETHEREUM:${conf.testErc20.options.address}`),
			},
			expirationDate: new Date(),
		})

		const nextStock = "1"
		const order = await awaitStock(sdk1, orderId, nextStock)
		expect(order.makeStock.toString()).toEqual(nextStock)

		const fillAction = await sdk2.order.buy.prepare({ orderId })

		let errorMessage
		try {
			const tx = await fillAction.submit({ amount: 1 })
			await tx.wait()
		} catch (e: any) {
			errorMessage = e.message
		}
		expect(errorMessage).toBeTruthy()
	})

	test("erc721 sell/buy using erc-20 with CurrencyId", async () => {
		const wallet1Address = wallet1.getAddressString()
		const wallet2Address = wallet2.getAddressString()
		await sentTx(
			conf.testErc20.methods.mint(wallet2Address, 100),
			{ from: wallet1Address, gas: 200000 }
		)
		const action = await sdk1.nft.mint.prepare({
			collectionId: convertEthereumCollectionId(erc721Address, Blockchain.ETHEREUM),
		})
		const result = await action.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumToUnionAddress(wallet1Address, Blockchain.ETHEREUM),
				value: 10000,
			}],
			royalties: [],
			lazyMint: false,
			supply: 1,
		})
		if (result.type === MintType.ON_CHAIN) {
			await result.transaction.wait()
		}

		await awaitItem(sdk1, result.itemId)

		const sellAction = await sdk1.order.sell.prepare({ itemId: result.itemId })
		const orderId = await sellAction.submit({
			amount: 1,
			price: "0.000000000000000002",
			currency: toCurrencyId(`ETHEREUM:${conf.testErc20.options.address}`),
		})

		const nextStock = "1"
		const order = await awaitStock(sdk1, orderId, nextStock)
		expect(order.makeStock.toString()).toEqual(nextStock)

		const fillAction = await sdk2.order.buy.prepare({ order })

		const tx = await fillAction.submit({ amount: 1 })
		await tx.wait()

		const nextStock2 = "0"
		const order2 = await awaitStock(sdk1, orderId, nextStock2)
		expect(order2.makeStock.toString()).toEqual(nextStock2)
	})

	test("erc721 sell/buy using erc-20 with CurrencyId with basic functions", async () => {
		const wallet1Address = wallet1.getAddressString()
		const wallet2Address = wallet2.getAddressString()
		await sentTx(
			conf.testErc20.methods.mint(wallet2Address, 100),
			{ from: wallet1Address, gas: 200000 }
		)
		const result = await sdk1.nft.mint({
			collectionId: convertEthereumCollectionId(erc721Address, Blockchain.ETHEREUM),
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumToUnionAddress(wallet1Address, Blockchain.ETHEREUM),
				value: 10000,
			}],
			royalties: [],
		})
		await result.transaction.wait()

		await awaitItem(sdk1, result.itemId)

		const orderId = await sdk1.order.sell({
			itemId: result.itemId,
			amount: 1,
			price: "0.000000000000000002",
			currency: toCurrencyId(`ETHEREUM:${conf.testErc20.options.address}`),
		})

		const nextStock = "1"
		const order = await awaitStock(sdk1, orderId, nextStock)
		expect(order.makeStock.toString()).toEqual(nextStock)

		const tx = await sdk2.order.buy({
			order,
			amount: 1,
		})

		await tx.wait()

		const nextStock2 = "0"
		const order2 = await awaitStock(sdk1, orderId, nextStock2)
		expect(order2.makeStock.toString()).toEqual(nextStock2)
	})

	test("get future order fees", async () => {
		const fees = await sdk1.restriction.getFutureOrderFees(
			toItemId("ETHEREUM:0x1AF7A7555263F275433c6Bb0b8FdCD231F89B1D7:15754214302034704911334786657881932847148102202883437712117637319024858628267")
		)
		expect(fees.originFeeSupport).toBe(OriginFeeSupport.FULL)
		expect(fees.baseFee).toBe(0)
	})
})

describe.skip("buy item with opensea order", () => {
	const { provider } = createE2eProvider("0x00120de4b1518cf1f16dc1b02f6b4a8ac29e870174cb1d8575f578480930250a", {
		rpcUrl: "https://node-rinkeby.rarible.com",
		networkId: 4,
	})

	const web3 = new Web3(provider)
	const ethereum1 = new Web3Ethereum({ web3 })
	const meta = toWord(id32("CUSTOM_META"))
	const sdk1 = createRaribleSdk(new EthereumWallet(ethereum1), "testnet", {
		logs: LogsLevel.DISABLED,
		blockchain: {
			[BlockchainGroup.ETHEREUM]: {
				marketplaceMarker: "0x000000000000000000000000000000000000000000000009",
				[Blockchain.ETHEREUM]: {
					openseaOrdersMetadata: meta,
				},
			},
		},
	})

	test("buy opensea item with specifying origin", async () => {
		const orderId = toOrderId("ETHEREUM:0x298fab77f8c8af0f4adf014570287689f7b9228307eaaf657a7446bc8eab0bc1")

		const fillAction = await sdk1.order.buy.prepare({ orderId })
		const tx = await fillAction.submit({ amount: 1 })
		await tx.wait()
	})

	test("buy item with seaport", async () => {
		const orderId = toOrderId("ETHEREUM:0xefc670c6a0a5659c623a6c7163f715317cbf44139119d9ebe2d636a0f1754776")
		const itemId = toItemId("ETHEREUM:0x1af7a7555263f275433c6bb0b8fdcd231f89b1d7:15754214302034704911334786657881932847148102202883437712117637319024858628148")
		const fillAction = await sdk1.order.buy.prepare({ orderId })
		const tx = await fillAction.submit({ amount: 1 })
		await tx.wait()
		await awaitForOwnership(sdk1, itemId, await ethereum1.getFrom())
	})

	test("buy item with looksrare order", async () => {
		const orderId = toOrderId("ETHEREUM:0xebec9809427f03c5182ad4f463d3b66149e1272a2db691323f14d1b0c675d406")
		const itemId = toItemId("ETHEREUM:0x1AF7A7555263F275433c6Bb0b8FdCD231F89B1D7:15754214302034704911334786657881932847148102202883437712117637319024858628267")
		const fillAction = await sdk1.order.buy.prepare({ orderId })
		const tx = await fillAction.submit({ amount: 1 })
		await tx.wait()
		await awaitForOwnership(sdk1, itemId, await ethereum1.getFrom())
	})
})
