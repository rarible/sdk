import { EthereumWallet } from "@rarible/sdk-wallet"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress, toContractAddress, toUnionAddress } from "@rarible/types"
import { MintType } from "../../types/nft/mint/domain"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { retry } from "../../common/retry"
import { providerDevelopmentSettings } from "./test/common"

describe("mintAndSell", () => {
	const { provider, wallet } = createE2eProvider(undefined, providerDevelopmentSettings)
	const ethereum = new Web3Ethereum({ web3: new Web3(provider) })
	const ethereumWallet = new EthereumWallet(ethereum)
	const sdk = createRaribleSdk(ethereumWallet, "development", { logs: LogsLevel.DISABLED })
	const erc721Address = toAddress("0x96CE5b00c75e28d7b15F25eA392Cbb513ce1DE9E")

	test("prepare should work even if wallet is undefined", async () => {
		const collection = await sdk.apis.collection.getCollectionById({
			collection: `ETHEREUM:${erc721Address}`,
		})
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
