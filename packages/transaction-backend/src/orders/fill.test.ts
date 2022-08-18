import Web3 from "web3"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { createErc721V3Collection } from "@rarible/protocol-ethereum-sdk/build/common/mint"
import { MintResponseTypeEnum } from "@rarible/protocol-ethereum-sdk/build/nft/mint"
import { retry } from "@rarible/protocol-ethereum-sdk/build/common/retry"
// @ts-ignore
import supertest from "supertest"
import { app } from "../app"

describe.skip("get buy transaction", () => {
	const { provider } = createE2eProvider("ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9")
	const web3Seller = new Web3(provider as any)
	const ethereum1 = new Web3Ethereum({ web3: web3Seller, gas: 1000000 })
	const sdkItemOwner = createRaribleSdk(ethereum1, process.env.SDK_ENV as EthereumNetwork)
	const erc721Address = "0x797cb2325e762e6178452b1D7478Aa616aA1656E"

	const buyerPk = "26250bb39160076f030517503da31e11aca80060d14f84ebdaced666efb89e21"
	const { provider: providerBuyer } = createE2eProvider(buyerPk)
	const web3Buyer = new Web3(providerBuyer as any)

	it("get buy transaction and send from buyer", async () => {
		const itemOwnerAddress = await ethereum1.getFrom()
		const [buyerAddress] = await web3Buyer.eth.getAccounts()

		const mintResult = await sdkItemOwner.nft.mint({
			uri: "ipfs://ipfs/hash",
			creators: [{
				account: itemOwnerAddress as any,
				value: 10000,
			}],
			lazy: false,
			collection: createErc721V3Collection(erc721Address as any),
		})
		if (mintResult.type === MintResponseTypeEnum.ON_CHAIN) {
			await mintResult.transaction.wait()
		}
		await retry(10, 2000, () => {
			return sdkItemOwner.apis.nftItem.getNftItemById({ itemId: mintResult.itemId })
		})

		const sellOrder = await sdkItemOwner.order.sell({
			type: "DATA_V2",
			makeAssetType: {
				assetClass: "ERC721",
				contract: erc721Address as any,
				tokenId: mintResult.tokenId,
			},
			amount: 1,
			takeAssetType: {
				assetClass: "ETH",
			},
			priceDecimal: "0.000000000000000002",
			payouts: [],
			originFees: [],
		})

		const response = await supertest(app)
			.post("/v0.1/orders/fill-tx")
			.send({
				from: "ETHEREUM:" + buyerAddress,
				request: {
					order: sellOrder,
					amount: 1,
					originFees: [],
					payouts: [],
				},
			})
			.expect(200)

		const buyerNonce = await web3Buyer.eth.getTransactionCount(buyerAddress, "latest") // nonce starts counting from 0
		const buyerTxData = {
			...response.body,
			nonce: buyerNonce,
			gasLimit: 200000,
		}
		const signedBuyerTx = await web3Buyer.eth.accounts.signTransaction(buyerTxData, buyerPk)

		if (!signedBuyerTx.rawTransaction) {
			throw new Error("Raw transaction is empty")
		}
		await web3Buyer.eth.sendSignedTransaction(signedBuyerTx.rawTransaction)

		await retry(5, 2000, async () => {
			await sdkItemOwner.apis.nftOwnership.getNftOwnershipById({
				ownershipId: `${mintResult.itemId}:${buyerAddress}`,
			})
		})
	})

	it("get buy transaction with orderId and send from buyer", async () => {
		const itemOwnerAddress = await ethereum1.getFrom()
		const [buyerAddress] = await web3Buyer.eth.getAccounts()

		const mintResult = await sdkItemOwner.nft.mint({
			uri: "ipfs://ipfs/hash",
			creators: [{
				account: itemOwnerAddress as any,
				value: 10000,
			}],
			lazy: false,
			collection: createErc721V3Collection(erc721Address as any),
		})
		if (mintResult.type === MintResponseTypeEnum.ON_CHAIN) {
			await mintResult.transaction.wait()
		}
		await retry(10, 2000, () => {
			return sdkItemOwner.apis.nftItem.getNftItemById({ itemId: mintResult.itemId })
		})

		const sellOrder = await sdkItemOwner.order.sell({
			type: "DATA_V2",
			makeAssetType: {
				assetClass: "ERC721",
				contract: erc721Address as any,
				tokenId: mintResult.tokenId,
			},
			amount: 1,
			takeAssetType: {
				assetClass: "ETH",
			},
			priceDecimal: "0.000000000000000002",
			payouts: [],
			originFees: [],
		})

		const response = await supertest(app)
			.post("/v0.1/orders/fill-tx")
			.send({
				from: "ETHEREUM:" + buyerAddress,
				request: {
					orderId: "ETHEREUM:" + sellOrder.hash,
					amount: 1,
					originFees: [],
					payouts: [],
				},
			})
			.expect(200)

		const buyerNonce = await web3Buyer.eth.getTransactionCount(buyerAddress, "latest") // nonce starts counting from 0
		const buyerTxData = {
			...response.body,
			nonce: buyerNonce,
			gasLimit: 200000,
		}
		const signedBuyerTx = await web3Buyer.eth.accounts.signTransaction(buyerTxData, buyerPk)

		if (!signedBuyerTx.rawTransaction) {
			throw new Error("Raw transaction is empty")
		}
		await web3Buyer.eth.sendSignedTransaction(signedBuyerTx.rawTransaction)

		await retry(40, 2000, async () => {
			await sdkItemOwner.apis.nftOwnership.getNftOwnershipById({
				ownershipId: `${mintResult.itemId}:${buyerAddress}`,
			})
		})

	})
})
