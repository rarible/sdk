import {
	awaitAll,
	createE2eProvider,
	deployTestErc1155,
	deployTestErc20,
	deployTestErc721ForAuction,
} from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress, toBigNumber } from "@rarible/types"
import { sentTx, getSimpleSendWithInjects } from "../common/send-transaction"
import { getEthereumConfig } from "../config"
import { approve as approveTemplate } from "../order/approve"
import { createEthereumApis } from "../common/apis"
import { getNetworkFromChainId } from "../common"
import { StartAuction } from "./start"

describe.skip("start auction", () => {
	const { provider, wallet } = createE2eProvider("0xa0d2baba419896add0b6e638ba4e50190f331db18e3271760b12ce87fa853dcb")
	const { wallet: feeWallet } = createE2eProvider()

	const sender1Address = wallet.getAddressString()
	const feeWalletAddress = feeWallet.getAddressString()
	const web3 = new Web3(provider as any)
	const config = getEthereumConfig("testnet")
	const getConfig = async () => config

	const ethereum1 = new Web3Ethereum({ web3, from: sender1Address, gas: 1000000 })
	const send = getSimpleSendWithInjects()

	const approve1 = approveTemplate.bind(null, ethereum1, send, getConfig)
	const getApis1 = async () => {
		const chainId = await ethereum1.getChainId()
		const env = getNetworkFromChainId(chainId)
		return createEthereumApis(env)
	}
	const auctionService = new StartAuction(ethereum1, send, getConfig, "testnet", approve1, getApis1)

	const it = awaitAll({
		testErc721: deployTestErc721ForAuction(web3, "TST", "TST"),
		testErc1155: deployTestErc1155(web3, "TST"),
		testErc20: deployTestErc20(web3, "TST", "TST"),
	})

	test("start erc-721 <-> eth auction", async () => {

		await sentTx(it.testErc721.methods.mint(sender1Address, 1), { from: sender1Address })

		const auctionResponse = await auctionService.start(
			{
				makeAssetType: {
					assetClass: "ERC721",
					contract: toAddress(it.testErc721.options.address),
					tokenId: toBigNumber("1"),
				},
				amount: toBigNumber("1"),
				takeAssetType: {
					assetClass: "ETH",
				},
				minimalStepDecimal: toBigNumber("0.00000000000000001"),
				minimalPriceDecimal: toBigNumber("0.00000000000000001"),
				duration: 1000,
				startTime: Math.floor(Date.now() / 1000) + 100,
				buyOutPriceDecimal: toBigNumber("0.0000000000000001"),
			}
		)

		await auctionResponse.tx.wait()
		expect(await auctionResponse.hash).toBeTruthy()
		expect(await auctionResponse.auctionId).toBeTruthy()
	})

	test("start erc-1155 <-> eth auction", async () => {
		await sentTx(it.testErc1155.methods.mint(sender1Address, 1, 10, "0x"), { from: sender1Address })

		const auctionResponse = await auctionService.start(
			{
				makeAssetType: {
					assetClass: "ERC1155",
					contract: toAddress(it.testErc1155.options.address),
					tokenId: toBigNumber("1"),
				},
				amount: toBigNumber("1"),
				takeAssetType: {
					assetClass: "ETH",
				},
				minimalStepDecimal: toBigNumber("0.00000000000000001"),
				minimalPriceDecimal: toBigNumber("0.00000000000000005"),
				duration: 1000,
				startTime: Math.floor(Date.now() / 1000) + 100,
				buyOutPriceDecimal: toBigNumber("0.00000000000000006"),
				originFees: [{
					account: toAddress(feeWalletAddress),
					value: 250,
				}],
			}
		)

		await auctionResponse.tx.wait()
	})

	test("start erc-721 <-> erc20 auction", async () => {
		await sentTx(it.testErc721.methods.mint(sender1Address, 2), { from: sender1Address })

		const auctionResponse = await auctionService.start(
			{
				makeAssetType: {
					assetClass: "ERC721",
					contract: toAddress(it.testErc721.options.address),
					tokenId: toBigNumber("2"),
				},
				amount: toBigNumber("1"),
				takeAssetType: {
					assetClass: "ERC20",
					contract: toAddress(it.testErc20.options.address),
				},
				minimalStepDecimal: toBigNumber("0.00000000000000001"),
				minimalPriceDecimal: toBigNumber("0.00000000000000005"),
				duration: 1000,
				startTime: Math.floor(Date.now() / 1000) + 5,
				buyOutPriceDecimal: toBigNumber("0.0000000000000006"),
				originFees: [],
			}
		)

		await auctionResponse.tx.wait()
	})

	test("start erc-1155 <-> erc20 auction", async () => {
		await sentTx(it.testErc1155.methods.mint(sender1Address, 2, 10, "0x"), { from: sender1Address })

		const auctionResponse = await auctionService.start(
			{
				makeAssetType: {
					assetClass: "ERC1155",
					contract: toAddress(it.testErc1155.options.address),
					tokenId: toBigNumber("2"),
				},
				amount: toBigNumber("1"),
				takeAssetType: {
					assetClass: "ERC20",
					contract: toAddress(it.testErc20.options.address),
				},
				minimalStepDecimal: toBigNumber("0.00000000000000001"),
				minimalPriceDecimal: toBigNumber("0.00000000000000005"),
				duration: 0,
				startTime: 0,
				buyOutPriceDecimal: toBigNumber("0.0000000000000006"),
				originFees: [],
			}
		)

		await auctionResponse.tx.wait()
	})
})
