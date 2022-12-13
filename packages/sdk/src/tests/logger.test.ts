import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import type { LoggableValue } from "@rarible/logger/build/domain"
import { Blockchain } from "@rarible/api-client"
import { toCollectionId, toItemId, toOrderId } from "@rarible/types"
import { createRaribleSdk } from "../index"
import { LogsLevel } from "../domain"
import { initProvider } from "../sdk-blockchains/ethereum/test/init-providers"
import { MintType } from "../types/nft/mint/prepare"
import { retry } from "../common/retry"

describe("Logging", () => {
	const config = {
		networkId: 300500,
		rpcUrl: "https://dev-ethereum-node.rarible.com",
	}
	const { web3, wallet: ethWallet } = initProvider(
		"0x4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7",
		config
	)
	const ethereum = new Web3Ethereum({
		web3: web3,
		from: ethWallet.getAddressString(),
	})
	const wallet = new EthereumWallet(ethereum)

	const { web3: web32, wallet: ethWallet2 } = initProvider(undefined, config)
	const ethereum2 = new Web3Ethereum({
		web3: web32,
		from: ethWallet2.getAddressString(),
	})
	const wallet2 = new EthereumWallet(ethereum2)

	const getLogger = () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const raw = jest.fn((data: Record<string, LoggableValue>) => {
			//console.log("LOG", data)
		})
		return {
			raw,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			trace: (...params: LoggableValue[]) => {},
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			debug: (...params: LoggableValue[]) => {},
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			info: (...params: LoggableValue[]) => {},
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			warn: (...params: LoggableValue[]) => {},
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			error: (...params: LoggableValue[]) => {},
		}
	}

	let collectionAddress: string | undefined = undefined

	test("Should log simple blockchain call", async () => {
		const logger = getLogger()
		const sdk = await createRaribleSdk(wallet, "development", { logs: LogsLevel.TRACE, logger })
		const collection = await sdk.nft.createCollection({
			blockchain: Blockchain.ETHEREUM,
			baseURI: "1",
			contractURI: "1",
			name: "1",
			isPublic: true,
			type: "ERC721",
			symbol: "1",
		})
		expect(logger.raw.mock.calls.length).toEqual(1)
		expect(logger.raw.mock.calls[0][0]).toMatchObject({
			level: "TRACE",
			method: "nft.createCollection",
		})
		console.log(logger.raw.mock.calls[0][0])
		expect(Object.keys(logger.raw.mock.calls[0][0])).toEqual([
			"level",
			"method",
			"message",
			"duration",
			"args",
			"resp",
		])
		await collection.tx.wait()
		collectionAddress = collection.address
		await retry(10, 2000, async () => await sdk.apis.collection.getCollectionById({
			collection: collection.address,
		}))
	})

	test("Should log simple api call", async () => {
		const logger = getLogger()
		const sdk = await createRaribleSdk(wallet, "development", { logs: LogsLevel.TRACE, logger })
		await sdk.apis.collection.getCollectionById({
			collection: collectionAddress!,
		})
		expect(logger.raw.mock.calls.length).toEqual(1)
		expect(logger.raw.mock.calls[0][0]).toMatchObject({
			level: "TRACE",
			method: "apis.collection.getCollectionById",
		})
	})

	let nftId: string | undefined = undefined
	test("Should log prepared blockchain call", async () => {
		const logger = getLogger()
		const sdk = await createRaribleSdk(wallet, "development", { logs: LogsLevel.TRACE, logger })
		const prepare = await sdk.nft.mint.prepare({
			collectionId: toCollectionId(collectionAddress!),
		})
		const nft = await prepare.submit({ uri: "1", supply: 1, lazyMint: false })
		expect(logger.raw.mock.calls.length).toBeGreaterThanOrEqual(3)
		// logger.raw.mock.calls[0] is for api call log, blockchain specific
		expect(logger.raw.mock.calls[1][0]).toMatchObject({
			level: "TRACE",
			method: "nft.mint.prepare",
		})
		expect(logger.raw.mock.calls[2][0]).toMatchObject({
			level: "TRACE",
			method: "nft.mint.prepare.submit.mint",
		})
		if (nft.type === MintType.ON_CHAIN) {
			await nft.transaction.wait()
		}
		nftId = nft.itemId
		await retry(10, 2000, async () => await sdk.apis.item.getItemById({
			itemId: nft.itemId,
		}))
	})

	let orderId: undefined | string = undefined
	test("Should log simplified blockchain call", async () => {
		const logger = getLogger()
		const sdk = await createRaribleSdk(wallet, "development", { logs: LogsLevel.TRACE, logger })
		orderId = await sdk.order.sell({ itemId: toItemId(nftId!), currency: { "@type": "ETH" }, amount: 1, price: 0.000001 })
		expect(logger.raw.mock.calls[0][0]).toMatchObject({
			level: "TRACE",
			method: "order.sell",
		})
	})

	test("Should log error api call", async () => {
		const logger = getLogger()
		const sdk = await createRaribleSdk(wallet, "development", { logs: LogsLevel.TRACE, logger })
		try {
			await sdk.apis.collection.getCollectionById({
				collection: "unknown",
			})
		} catch (e) {}
		expect(logger.raw.mock.calls.length).toEqual(1)
		expect(logger.raw.mock.calls[0][0]).toMatchObject({
			level: "WARN",
			method: "apis.collection.getCollectionById",
		})
		expect(logger.raw.mock.calls[0][0].error).toMatch("NetworkError")
		expect(logger.raw.mock.calls[0][0].error).toMatch("NETWORK_ERR")
	})

	test("Should log error simplified blockchain call", async () => {
		const logger = getLogger()
		const sdk = await createRaribleSdk(wallet2, "development", { logs: LogsLevel.TRACE, logger })
		try {
			await sdk.order.buy({ orderId: toOrderId(orderId!), amount: 1 })
		} catch (e) {
			console.log(e)
		}
		expect(logger.raw.mock.calls[0][0]).toMatchObject({
			level: "ERROR",
			method: "order.buy",
		})
	})
})
