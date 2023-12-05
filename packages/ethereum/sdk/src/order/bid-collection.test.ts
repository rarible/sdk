import { toAddress, toContractAddress, ZERO_WORD } from "@rarible/types"
import {
	Configuration,
	CollectionControllerApi,
	ItemControllerApi,
	OrderControllerApi,
} from "@rarible/api-client"
import { awaitAll, createE2eProvider, deployTestErc721 } from "@rarible/ethereum-sdk-test-common"
import { toBn } from "@rarible/utils"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toBigNumber } from "@rarible/types"
import { getItemIdData } from "@rarible/sdk-common/src"
import { getEthereumConfig } from "../config"
import { getApiConfig } from "../config/api-config"
import { sentTx, getSimpleSendWithInjects, getSendWithInjects } from "../common/send-transaction"
import { delay } from "../common/retry"
import { createEthereumApis } from "../common/apis"
import { createErc721V3Collection } from "../common/mint"
import type { ERC721RequestV3, MintOffChainResponse } from "../nft/mint"
import { mint as mintTemplate } from "../nft/mint"
import { signNft } from "../nft/sign-nft"
import type { EthereumNetwork } from "../types"
import { DEV_PK_1, DEV_PK_2 } from "../common/test/test-credentials"
import { getEthUnionAddr } from "../common/test"
import { OrderBid } from "./bid"
import { signOrder as signOrderTemplate } from "./sign-order"
import { OrderFiller } from "./fill-order"
import { UpsertOrder } from "./upsert-order"
import { checkAssetType as checkAssetTypeTemplate } from "./check-asset-type"
import { checkChainId } from "./check-chain-id"
import type { SimpleRaribleV2Order } from "./types"
import { approve as approveTemplate } from "./approve"
import { createErc20Contract } from "./contracts/erc20"

describe("bid", () => {
	const { provider: provider1 } = createE2eProvider(DEV_PK_1)
	const web31 = new Web3(provider1)
	const ethereum1 = new Web3Ethereum({ web3: web31 })

	const { provider: provider2 } = createE2eProvider(DEV_PK_2)
	const web32 = new Web3(provider2)
	const ethereum2 = new Web3Ethereum({ web3: web32 })

	const env: EthereumNetwork = "dev-ethereum"
	const configuration = new Configuration(getApiConfig(env))
	const apis = createEthereumApis(env)
	const config = getEthereumConfig(env)
	const signOrder2 = signOrderTemplate.bind(null, ethereum2, config)
	const checkAssetType = checkAssetTypeTemplate.bind(null, apis.nftCollection)
	const checkWalletChainId2 = checkChainId.bind(null, ethereum2, config)

	const getBaseOrderFee = async () => 0
	const send2 = getSimpleSendWithInjects().bind(null, checkWalletChainId2)
	const orderService = new OrderFiller(ethereum2, send2, config, apis, getBaseOrderFee, env)
	const approve2 = approveTemplate.bind(null, ethereum2, send2, config.transferProxies)


	const upserter = new UpsertOrder(
		orderService,
		send2,
		config,
		(x) => Promise.resolve(x),
		approve2,
		signOrder2,
		apis.order,
		ethereum2,
		checkWalletChainId2,
		ZERO_WORD
	)
	const orderBid = new OrderBid(upserter, ethereum2, checkAssetType, checkWalletChainId2)

	const checkWalletChainId1 = checkChainId.bind(null, ethereum1, config)
	const send1 = getSendWithInjects().bind(null, checkWalletChainId1)
	const sign1 = signNft.bind(null, ethereum1, 300500)
	const mint1 = mintTemplate
		.bind(null, ethereum1, send1, sign1, apis.nftCollection)
		.bind(null, apis.nftItem, checkWalletChainId1)
	const e2eErc721V3ContractAddress = getEthUnionAddr("0x6972347e66A32F40ef3c012615C13cB88Bf681cc")
	const erc20Contract = toAddress("0xA4A70E8627e858567a9f1F08748Fe30691f72b9e")

	const it = awaitAll({
		testErc721: deployTestErc721(web31, "Test", "TST"),
	})

	beforeAll(async () => {
		const tx = await send2(
			createErc20Contract(ethereum2, erc20Contract)
				.functionCall("mint", await ethereum2.getFrom(), "1000000000000000000")
		)
		await tx.wait()
	})

	const filler1 = new OrderFiller(ethereum1, send1, config, apis, getBaseOrderFee, env)

	test("create bid for collection", async () => {
		const ownerCollectionAddress = toAddress(await ethereum1.getFrom())
		const bidderAddress = toAddress(await ethereum2.getFrom())

		await sentTx(it.testErc721.methods.mint(ownerCollectionAddress, 0, "0x"), { from: ownerCollectionAddress })
		await sentTx(it.testErc721.methods.mint(ownerCollectionAddress, 1, "0x"), { from: ownerCollectionAddress })
		await delay(5000)

		const { order } = await orderBid.bid({
			type: "DATA_V2",
			maker: getEthUnionAddr(bidderAddress),
			end: generateExpirationTimestamp(),
			makeAssetType: {
				"@type": "ERC20",
				contract: erc20Contract,
			},
			takeAssetType: {
				"@type": "COLLECTION",
				contract: toAddress(it.testErc721.options.address),
			},
			price: toBn("1000000000000000000"),
			amount: 1,
			payouts: [],
			originFees: [],
		})

		const acceptBidTx = await filler1.acceptBid({
			order: order as SimpleRaribleV2Order,
			amount: 1,
			originFees: [],
			assetType: {
				assetClass: "ERC721",
				contract: toAddress(it.testErc721.options.address),
				tokenId: toBigNumber("1"),
			},
		})
		await acceptBidTx.wait()
	})

	test("create bid for erc-721 collection and accept bid with lazy-item", async () => {
		const ownerCollectionAddress = toAddress(await ethereum1.getFrom())
		const bidderAddress = toAddress(await ethereum2.getFrom())

		const mintedItem = await mint1({
			collection: createErc721V3Collection(e2eErc721V3ContractAddress),
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{ account: getEthUnionAddr(ownerCollectionAddress), value: 10000 }],
			royalties: [],
			lazy: true,
		} as ERC721RequestV3) as MintOffChainResponse

		const { order } = await orderBid.bid({
			type: "DATA_V2",
			maker: getEthUnionAddr(bidderAddress),
			end: generateExpirationTimestamp(),
			makeAssetType: {
				"@type": "ERC20",
				contract: erc20Contract,
			},
			takeAssetType: {
				"@type": "COLLECTION",
				contract: e2eErc721V3ContractAddress,
			},
			price: toBn("10000"),
			amount: 1,
			payouts: [],
			originFees: [],
		})

		const acceptBidTx = await filler1.acceptBid({
			order: order as SimpleRaribleV2Order,
			amount: 1,
			originFees: [],
			assetType: {
				contract: toContractAddress(e2eErc721V3ContractAddress),
				tokenId: getItemIdData(mintedItem.item).tokenId,
			},
		})
		await acceptBidTx.wait()
	})

})


function generateExpirationTimestamp() {
	const expirationAt = new Date(Date.now() + 1000 * 60 * 60)
	return Math.floor(expirationAt.getTime() / 1000)
}
