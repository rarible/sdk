import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toBigNumber, toContractAddress, toUnionAddress } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import { deployTestErc20 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc20"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import { sell } from "./common/atoms-tests/sell"
import { getEthereumWallet, getWalletAddress } from "./common/wallet"
import { createSdk } from "./common/create-sdk"
import { mint } from "./common/atoms-tests/mint"
import { awaitStock, getCollection } from "./common/helpers"
import { buy } from "./common/atoms-tests/buy"

const suites: {
	blockchain: Blockchain,
	wallets: {seller: BlockchainWallet, buyer: BlockchainWallet},
	collectionId: string,
	mintRequest: (address: UnionAddress) => MintRequest,
	getCurrency: (wallet: {seller: BlockchainWallet, buyer: BlockchainWallet}) => Promise<RequestCurrency>
}[] = [
	{
		blockchain: Blockchain.ETHEREUM,
		wallets: { seller: getEthereumWallet(), buyer: getEthereumWallet() },
		collectionId: "ETHEREUM:0x22f8CE349A3338B15D7fEfc013FA7739F5ea2ff7",
		mintRequest: (walletAddress: UnionAddress) => {
			return {
				uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
				creators: [{
					account: walletAddress,
					value: 10000,
				}],
				royalties: [],
				lazyMint: false,
				supply: 1,
			}
		},
		getCurrency: async (wallets: {seller: BlockchainWallet, buyer: BlockchainWallet}): Promise<RequestCurrency> => {
			if (wallets.seller.blockchain === "ETHEREUM" && wallets.buyer.blockchain === "ETHEREUM") {
				const testErc20 = await deployTestErc20((wallets.seller.ethereum as any).config.web3, "test erc20", "TST20")
				await testErc20.methods.mint(await getWalletAddress(wallets.buyer, false), 100).send({
					from: await getWalletAddress(wallets.seller, false),
					gas: 200000,
				})

				return {
					"@type": "ERC20",
					contract: toContractAddress(`ETHEREUM:${testErc20.options.address}`),
				}
			}

			throw new Error("Wrong blockchain")
		},
	},
	/*{
		blockchain: Blockchain.TEZOS,
		mintRequest: (walletAddress: UnionAddress) => {
			return {
				uri: "ipfs:/test",
				creators: [{
					account: walletAddress,
					value: 10000,
				}],
				royalties: [],
				lazyMint: false,
				supply: 1,
			}
		},
	},*/
]


describe("mint-sell-buy", () => {
	for (const suite of suites) {
		describe(suite.blockchain, () => {
			const { seller: sellerWallet, buyer: buyerWallet } = suite.wallets
			const sellerSdk = createSdk(suite.blockchain, sellerWallet)
			const buyerSdk = createSdk(suite.blockchain, buyerWallet)

			test("should mint, then sell, then buy", async () => {
				const sellerWalletAddress = toUnionAddress(await getWalletAddress(sellerWallet))

				const collection = await getCollection(sellerSdk, suite.collectionId)
				const { nft } = await mint(sellerSdk, sellerWallet, { collection }, suite.mintRequest(sellerWalletAddress))

				const amount = 1
				const sellOrder = await sell(sellerSdk, sellerWallet, { itemId: nft.id }, {
					amount,
					price: "0.0000000000000001",
					currency: await suite.getCurrency(suite.wallets),
				})

				await buy(buyerSdk, buyerWallet, { orderId: sellOrder.id }, { amount })

				const nextStock = toBigNumber("0")
				await awaitStock(sellerSdk, sellOrder.id, nextStock)
			})
		})
	}
})
