import { awaitAll, createE2eProvider, deployTestErc1155, deployTestErc20 } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress, toBigNumber } from "@rarible/types"
import { AuctionControllerApi, Configuration } from "@rarible/ethereum-api-client"
import { sentTx, getSimpleSendWithInjects } from "../common/send-transaction"
import { getEthereumConfig } from "../config"
import { approve as approveTemplate } from "../order/approve"
import { getApiConfig } from "../config/api-config"
import { createEthereumApis } from "../common/apis"
import { checkChainId } from "../order/check-chain-id"
import { StartAuction } from "./start"
import { PutAuctionBid } from "./put-bid"
import { awaitForAuction } from "./test"

describe.skip("put auction bid", () => {
	const { provider, wallet: walletSeller } = createE2eProvider("0x00120de4b1518cf1f16dc1b02f6b4a8ac29e870174cb1d8575f578480930250a")
	const { provider: providerBuyer, wallet: walletBuyer } = createE2eProvider("0xa0d2baba419896add0b6e638ba4e50190f331db18e3271760b12ce87fa853dcb")
	const { wallet: feeWallet } = createE2eProvider()


	const sender1Address = walletSeller.getAddressString()
	const sender2Address = walletBuyer.getAddressString()
	const feeAddress = feeWallet.getAddressString()

	const web3 = new Web3(provider as any)
	const web3Buyer = new Web3(providerBuyer as any)
	const config = getEthereumConfig("testnet")

	const configuration = new Configuration(getApiConfig("testnet"))
	const apis = createEthereumApis("testnet")
	const auctionApi = new AuctionControllerApi(configuration)

	const ethereum1 = new Web3Ethereum({ web3, from: sender1Address, gas: 1000000 })
	const ethereum2 = new Web3Ethereum({ web3: web3Buyer, from: sender2Address, gas: 1000000 })

	const checkWalletChainId1 = checkChainId.bind(null, ethereum1, config)
	const checkWalletChainId2 = checkChainId.bind(null, ethereum2, config)

	const send1 = getSimpleSendWithInjects().bind(null, checkWalletChainId1)
	const send2 = getSimpleSendWithInjects().bind(null, checkWalletChainId2)
	const approve1 = approveTemplate.bind(null, ethereum1, send1, config.transferProxies)
	const approve2 = approveTemplate.bind(null, ethereum2, send2, config.transferProxies)

	const bidService = new PutAuctionBid(ethereum2, send2, config, "testnet", approve2, apis)

	const auctionStartService1 = new StartAuction(ethereum1, send1, config, "testnet", approve1, apis)

	const it = awaitAll({
		testErc1155: deployTestErc1155(web3, "TST"),
		testErc20: deployTestErc20(web3, "TST", "TST"),
	})

	test("put erc-1155 <-> erc-20 bid", async () => {
		await sentTx(it.testErc1155.methods.mint(sender1Address, 1, 10, "0x"), { from: sender1Address })
		await sentTx(it.testErc20.methods.mint(sender2Address, 300000), { from: sender1Address })

		const auction = await auctionStartService1.start(
			{
				makeAssetType: {
					assetClass: "ERC1155",
					contract: toAddress(it.testErc1155.options.address),
					tokenId: toBigNumber("1"),
				},
				amount: toBigNumber("1"),
				takeAssetType: {
					assetClass: "ERC20",
					contract: toAddress(it.testErc20.options.address),
				},
				minimalStepDecimal: toBigNumber("0.00000000000000001"),
				minimalPriceDecimal: toBigNumber("0.00000000000000005"),
				duration: 1000,
				buyOutPriceDecimal: toBigNumber("0.00000000000000010"),
				originFees: [],
			}
		)

		await auction.tx.wait()

		await awaitForAuction(auctionApi, await auction.hash)

		const putBidTx = await bidService.putBid({
			hash: await auction.hash,
			priceDecimal: toBigNumber("0.00000000000000005"),
			originFees: [],
		})

		await putBidTx.wait()
	})

	test("put erc-1155 <-> eth bid", async () => {
		await sentTx(it.testErc1155.methods.mint(sender1Address, 1, 10, "0x"), { from: sender1Address })

		const auction = await auctionStartService1.start(
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
				startTime: 0,
				buyOutPriceDecimal: toBigNumber("0.00000000000000500"),
				originFees: [{
					account: toAddress(feeAddress),
					value: 1000,
				}],
			}
		)
		await auction.tx.wait()

		await awaitForAuction(auctionApi, await auction.hash)

		const putBidTx = await bidService.putBid({
			hash: await auction.hash,
			priceDecimal: toBigNumber("0.00000000000000100"),
			originFees: [{
				account: toAddress(feeAddress),
				value: 1000,
			}],
		})
		await putBidTx.wait()
	})
})
