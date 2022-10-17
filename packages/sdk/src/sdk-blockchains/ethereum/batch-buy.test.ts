import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toContractAddress, toOrderId, toUnionAddress } from "@rarible/types"
import Web3 from "web3"
import { Blockchain } from "@rarible/api-client"
import type { IRaribleSdk } from "../../index"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { awaitItem } from "./test/await-item"
import { convertEthereumToUnionAddress } from "./common"

describe("Batch buy", () => {
	// 0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b
	const { provider: providerSeller } = createE2eProvider("0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c", {
		rpcUrl: "https://goerli-ethereum-node.rarible.com",
		networkId: 5,
	})

	const { provider: providerBuyer } = createE2eProvider("0x00120de4b1518cf1f16dc1b02f6b4a8ac29e870174cb1d8575f578480930250a", {
		rpcUrl: "https://goerli-ethereum-node.rarible.com",
		networkId: 5,
	})

	const web31 = new Web3(providerSeller)
	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const sdkSeller = createRaribleSdk(new EthereumWallet(ethereum1), "testnet", {
		logs: LogsLevel.DISABLED,
	})

	const web32 = new Web3(providerBuyer)
	const ethereum2 = new Web3Ethereum({ web3: web32 })
	const sdkBuyer = createRaribleSdk(new EthereumWallet(ethereum2), "testnet", {
		logs: LogsLevel.DISABLED,
	})

	async function mint(sdk: IRaribleSdk) {
		const sender = convertEthereumToUnionAddress("0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b", Blockchain.ETHEREUM)
		const contract = toContractAddress("ETHEREUM:0x1943D3ebbf1F26C2Ff37dFCcd4a1f9b9Dc91Afdf") //erc721
		const collection = await sdk.apis.collection.getCollectionById({
			collection: contract,
		})
		const tokenId = await sdk.nft.generateTokenId({
			collection: contract,
			minter: sender,
		})
		const action = await sdk.nft.mint({
			collection,
			tokenId: tokenId,
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
		})

		return awaitItem(sdk, result.itemId)
	}


	test("batch buy rarible orders", async () => {
		const tokens = await Promise.all([mint(sdkSeller), mint(sdkSeller)])
		//console.log(tokens)
		const orders = await Promise.all(tokens.map(async (token) => {
			const prep = await sdkSeller.order.sell({ itemId: token.id })
			return await prep.submit({
				amount: 1,
				price: "0.00000000001",
				currency: { "@type": "ETH" },
			})
		}))

		//console.log(orders)
		const prep = await sdkBuyer.order.batchBuy(orders.map((order) => ({ orderId: order })))
		const tx = await prep.submit(orders.map((order) => ({
			orderId: order,
			amount: 1,
			originFees: [{
				account: toUnionAddress("ETHEREUM:0xFc7b41fFC023bf3eab6553bf4881D45834EF1E8a"),
				value: 100,
			}],
		})))
		console.log(tx)
		await tx.wait()
	})

	test("get buy amm info", async () => {
		if (!sdkBuyer.ethereum) {
			throw new Error("Sdk was initialized without ethereum provider")
		}
		const data = await sdkBuyer.ethereum.getBatchBuyAmmInfo({
			hash: "0x000000000000000000000000d2bfdbb7be48d63ad3aaf5311786d2da2fc0fbea",
			numNFTs: 5,
		})
		expect(data.prices[4].price).toBeTruthy()
	})
})
