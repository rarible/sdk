import { EthereumWallet } from "@rarible/sdk-wallet"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress, toBigNumber, toCollectionId, toContractAddress, toOrderId, toUnionAddress } from "@rarible/types"
import type { Collection } from "@rarible/api-client"
import { Blockchain, CollectionFeatures, CollectionType, OrderStatus, Platform } from "@rarible/api-client"
import { MintType } from "../../types/nft/mint/domain"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { retry } from "../../common/retry"
import { providerDevelopmentSettings } from "./test/common"

describe.skip("mintAndSell", () => {
	const {
		provider,
		wallet,
	} = createE2eProvider(undefined, providerDevelopmentSettings)
	const ethereum = new Web3Ethereum({ web3: new Web3(provider) })
	const ethereumWallet = new EthereumWallet(ethereum)
	const sdk = createRaribleSdk(ethereumWallet, "development", { logs: LogsLevel.DISABLED })
	const erc721Address = toAddress("0x96CE5b00c75e28d7b15F25eA392Cbb513ce1DE9E")

	test("prepare should work even if wallet is undefined", async () => {
		// const collection = await sdk.apis.collection.getCollectionById({
		// 	collection: `ETHEREUM:${erc721Address}`,
		// })
		const collection: Collection = {
			id: toCollectionId("ETHEREUM:0x96CE5b00c75e28d7b15F25eA392Cbb513ce1DE9E"),
			blockchain: Blockchain.ETHEREUM,
			type: CollectionType.ERC1155,
			name: "name",
			owner: toUnionAddress("ETHEREUM:0xcf715bc7a0817507d0648fae6c6dd1c1e6f8fe56"),
			features: [
				CollectionFeatures.APPROVE_FOR_ALL,
				CollectionFeatures.SET_URI_PREFIX,
				CollectionFeatures.BURN,
				CollectionFeatures.MINT_WITH_ADDRESS,
				CollectionFeatures.SECONDARY_SALE_FEES,
				CollectionFeatures.MINT_AND_TRANSFER,
			],
			minters: [toUnionAddress("ETHEREUM:0xcf715bc7a0817507d0648fae6c6dd1c1e6f8fe56")],
			meta: {
				name: "Untitled",
				content: [],
			},
			bestBidOrder: {
				id: toOrderId("ETHEREUM:0x19eef9cadee457c2642e34278805dd9ad992d64980a428781b745f1e8d987f33"),
				fill: toBigNumber("0"),
				platform: Platform.RARIBLE,
				status: OrderStatus.ACTIVE,
				makeStock: toBigNumber("0.0000000000000005"),
				cancelled: false,
				createdAt: "2022-04-11T12:59:51.790Z",
				lastUpdatedAt: "2022-04-11T12:59:51.790Z",
				takePrice: toBigNumber("0.0000000000000001"),
				maker: toUnionAddress("ETHEREUM:0xa95e8f190179d999c53dd61f1a43284e12e8fdd2"),
				make: {
					type: {
						"@type": "ERC721",
						contract: toContractAddress("ETHEREUM:0x96CE5b00c75e28d7b15F25eA392Cbb513ce1DE9E"),
						tokenId: toBigNumber("!"),
					},
					value: toBigNumber("1"),
				},
				take: {
					type: {
						"@type": "ETH",
					},
					value: toBigNumber("1"),
				},
				salt: "0x83e8e03e0df70e0197619db44fa2e85b1b2a90830738b49ec9029352624395f4",
				signature: "0xae119b2b9fdf8e8ea15216605c9c73cf7713cac987fedb1f2705e6c11c2062155cae8257ec9996934760a1fe68ea90270a8d9e6f42a1fd3dc5d2f0e3e5ee06111b",
				pending: [],
				data: {
					"@type": "ETH_RARIBLE_V2",
					payouts: [],
					originFees: [],
				},
			},
		}
		const action = await sdk.nft.mintAndSell({ collection })
		expect(action.supportsRoyalties).toBeTruthy()
		expect(action.originFeeSupport).toBe("FULL")
	})

	test("should mint and put on sale ERC721 token", async () => {
		const senderRaw = wallet.getAddressString()
		const sender = toUnionAddress(`ETHEREUM:${senderRaw}`)
		const contract = toContractAddress(`ETHEREUM:${erc721Address}`)
		const collection = await sdk.apis.collection.getCollectionById({
			collection: contract,
		})

		const tokenId = await sdk.nft.generateTokenId({
			collection: contract,
			minter: sender,
		})
		const action = await sdk.nft.mintAndSell({
			collection,
			tokenId,
		})

		const result = await action.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: sender,
				value: 10000,
			}],
			royalties: [],
			lazyMint: false,
			supply: 1,
			price: "0.000000000000000001",
			currency: {
				"@type": "ETH",
			},
		})

		if (result.type === MintType.ON_CHAIN) {
			const transaction = await result.transaction.wait()
			expect(transaction.blockchain).toEqual("ETHEREUM")
			expect(transaction.hash).toBeTruthy()
		} else {
			throw new Error("Minted not on chain")
		}

		await retry(5, 2000, async () => {
			const order = await sdk.apis.order.getOrderById({ id: result.orderId })
			expect(order.makeStock.toString()).toBe("1")
			const item = await sdk.apis.item.getItemById({ itemId: result.itemId })
			expect(item.supply.toString()).toEqual("1")
			if (tokenId) {
				expect(item.tokenId).toEqual(tokenId.tokenId)
			} else {
				throw new Error("Token id must be defined")
			}
		})
	})
})
