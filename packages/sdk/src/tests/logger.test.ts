import type { LoggableValue } from "@rarible/logger/build/domain"
import { Blockchain } from "@rarible/api-client"
import { toCollectionId, toItemId, toOrderId } from "@rarible/types"
import { LogsLevel } from "../domain"
import { MintType } from "../types/nft/mint/prepare"
import { retry } from "../common/retry"
import {
	createEthWallets,
} from "../sdk-blockchains/ethereum/test/common"
import { createSdk } from "../common/test/create-sdk"

describe("Logging", () => {
	const [eth1, eth2, eth3, eth4, eth5, eth6] = createEthWallets(6)

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

	test("Should log simple blockchain call", async () => {
		const logger = getLogger()
		const sdk = createSdk(eth1, "development", { logs: LogsLevel.TRACE, logger })
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
		expect(Object.keys(logger.raw.mock.calls[0][0])).toEqual([
			"level",
			"method",
			"message",
			"duration",
			"args",
			"resp",
		])
		await collection.tx.wait()
		await retry(10, 2000, async () => await sdk.apis.collection.getCollectionById({
			collection: collection.address,
		}))
	})

	test.concurrent("Should log simple api call", async () => {
		const logger = getLogger()
		const sdk = createSdk(eth2, "development", { logs: LogsLevel.TRACE, logger })
		const collectionAddress = toCollectionId("ETHEREUM:0x3aEb3b6d820dd90B79886537F008f2c36E38beAE")
		await sdk.apis.collection.getCollectionById({
			collection: collectionAddress,
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
		const sdk = createSdk(eth3, "development", { logs: LogsLevel.TRACE, logger })
		const collectionAddress = toCollectionId("ETHEREUM:0x3aEb3b6d820dd90B79886537F008f2c36E38beAE")
		const prepare = await sdk.nft.mint.prepare({
			collectionId: collectionAddress,
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

	test("Should log simplified blockchain call", async () => {
		const logger = getLogger()
		const sdk = createSdk(eth4, "development", { logs: LogsLevel.TRACE, logger })
		await sdk.order.sell({ itemId: toItemId(nftId!), currency: { "@type": "ETH" }, amount: 1, price: 0.000001 })
		expect(logger.raw.mock.calls[0][0]).toMatchObject({
			level: "TRACE",
			method: "order.sell",
		})
	})

	test.concurrent("Should log error api call", async () => {
		const logger = getLogger()
		const sdk = createSdk(eth5, "development", { logs: LogsLevel.TRACE, logger })
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

	test.skip("Should handle error simplified blockchain call", async () => {
		const logger = getLogger()
		const sdk = createSdk(eth6, "development", { logs: LogsLevel.DISABLED, logger })
		try {
			const tx = await sdk.order.buy({ orderId: toOrderId("ETHEREUM:0x78dafa455051f8b7a1abcab8d028a7ef0a9e5c8db053176f826ba12e81b87292"), amount: 1 })
			await tx.wait()
		} catch (e) {}
		console.log("logger.raw.mock.calls, ", logger.raw.mock.calls)
		expect(logger.raw.mock.calls[0][0]).toMatchObject({
			level: "WARN",
			method: "order.buy",
		})
	})
})
