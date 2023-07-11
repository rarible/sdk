import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toAddress, toBigNumber } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk/src"
import { LogsLevel } from "@rarible/protocol-ethereum-sdk/src/types"
import { retry } from "@rarible/sdk/src/common/retry"
import { getEthereumWallet, getEthereumWalletBuyer, getWalletAddressFull } from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { getCollection } from "../../../common/helpers"
import { testsConfig } from "../../../common/config"

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallets: { seller: EthereumWallet, buyer: EthereumWallet },
	collectionId: string,
	mintRequest: (creatorAddress: UnionAddress) => MintRequest,
	currency: string,
	bidRequest: (currency: RequestCurrency) => Promise<OrderRequest>
}[] {
	return [
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721: Auction",
			wallets: {
				seller: getEthereumWallet(),
				buyer: getEthereumWalletBuyer(),
			},
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_721,
			mintRequest: (creatorAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: creatorAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 1,
				}
			},
			currency: "ERC20",
			bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "10",
					currency: currency,
				}
			},
		},
	]
}

describe.each(suites())("ETHEREUM auction", (suite) => {
	const {
		seller: sellerWallet,
		buyer: buyerWallet,
	} = suite.wallets
	const sellerSdk = createSdk(suite.blockchain, sellerWallet)
	const buyerSdk = createSdk(suite.blockchain, buyerWallet)

	const ethereumSellerSdk = createRaribleSdk(sellerWallet.ethereum, "dev-ethereum", { logs: { level: LogsLevel.ERROR } })
	const ethereumBuyerSdk = createRaribleSdk(buyerWallet.ethereum, "dev-ethereum")

	test.skip(suite.description, async () => {
		const walletAddressSeller = await getWalletAddressFull(sellerWallet)
		const walletAddressBuyer = await getWalletAddressFull(buyerWallet)

		const collection = await getCollection(sellerSdk, suite.collectionId)

		const { nft } = await mint(sellerSdk, sellerWallet, { collection },
			suite.mintRequest(walletAddressSeller.unionAddress))

		const auctionStartResponse = await ethereumSellerSdk.auction.start({
			makeAssetType: {
				assetClass: "ERC721",
				contract: toAddress(suite.collectionId.substring(9)),
				tokenId: nft.tokenId!,
			},
			amount: toBigNumber("1"),
			takeAssetType: {
				assetClass: "ERC20",
				contract: toAddress(testsConfig.variables.ETHEREUM_ERC20),
			},
			minimalStepDecimal: toBigNumber("0.1"),
			minimalPriceDecimal: toBigNumber("0.5"),
			duration: 54000,
			startTime: 0,
			buyOutPriceDecimal: toBigNumber("1"),
			originFees: [],
		})
		await auctionStartResponse.tx.wait()
		const auctionHash = await auctionStartResponse.hash

		const bidResponse = await ethereumBuyerSdk.auction.putBid({
			hash: auctionHash,
			priceDecimal: toBigNumber("0.2"),
		})
		await bidResponse.wait()

		await retry(15, 2000, async () => {
			const bids = await ethereumSellerSdk.apis.auction.getAuctionBidsByHash({ hash: auctionHash, size: 10 })
			expect(bids.bids).toHaveLength(1)
			expect(bids.bids[0].buyer).toBe(walletAddressBuyer.address)
		})
	})
})
