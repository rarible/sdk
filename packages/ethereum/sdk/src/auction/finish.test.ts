import { awaitAll, createE2eProvider, deployTestErc1155, deployTestErc20 } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress, toBigNumber } from "@rarible/types"
import { toBn } from "@rarible/utils"
import { sentTx, getSimpleSendWithInjects } from "../common/send-transaction"
import { getEthereumConfig } from "../config"
import { approve as approveTemplate } from "../order/approve"
import { createEthereumApis } from "../common/apis"
import { delay } from "../common/retry"
import { getNetworkFromChainId } from "../common"
import { StartAuction } from "./start"
import { finishAuction as finishAuctionTemplate } from "./finish"
import { PutAuctionBid } from "./put-bid"
import { awaitForAuction, awaitForAuctionBid } from "./test"


describe.skip("finish auction auction", () => {
	const { provider: providerSeller, wallet: walletSeller } = createE2eProvider("0xded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9")
	const { provider: providerBuyer, wallet: walletBuyer } = createE2eProvider("0xa0d2baba419896add0b6e638ba4e50190f331db18e3271760b12ce87fa853dcb")
	const { wallet: feeWallet } = createE2eProvider()

	const sender1Address = walletSeller.getAddressString()
	const sender2Address = walletBuyer.getAddressString()
	const feeAddress = feeWallet.getAddressString()
	const web3Seller = new Web3(providerSeller as any)
	const web3Buyer = new Web3(providerBuyer as any)

	const config = getEthereumConfig("testnet")
	const getConfig = async () => config

	const ethereum1 = new Web3Ethereum({ web3: web3Seller, from: sender1Address, gas: 1000000 })
	const ethereum2 = new Web3Ethereum({ web3: web3Buyer, from: sender2Address, gas: 1000000 })

	const send1 = getSimpleSendWithInjects()
	const send2 = getSimpleSendWithInjects()

	const approve1 = approveTemplate.bind(null, ethereum1, send1, getConfig)
	const approve2 = approveTemplate.bind(null, ethereum2, send2, getConfig)

	const apis = createEthereumApis("testnet")
	const getApis1 = async () => {
		const chainId = await ethereum1.getChainId()
		const env = getNetworkFromChainId(chainId)
		return createEthereumApis(env)
	}
	const getApis2 = async () => {
		const chainId = await ethereum2.getChainId()
		const env = getNetworkFromChainId(chainId)
		return createEthereumApis(env)
	}
	const auctionService = new StartAuction(ethereum1, send1, getConfig, "testnet", approve1, getApis1)
	const putBidService = new PutAuctionBid(ethereum2, send2, getConfig, "testnet", approve2, getApis2)

	const finishAuction = finishAuctionTemplate.bind(this, ethereum1, send1, getConfig, getApis1)

	const it = awaitAll({
		testErc1155: deployTestErc1155(web3Seller, "TST"),
		testErc20: deployTestErc20(web3Seller, "TST", "TST"),
	})

	test("finish auction erc-1155 <-> erc-20", async () => {
		const tokenId = "1"
		await sentTx(it.testErc1155.methods.mint(sender1Address, tokenId, 10, "0x"), { from: sender1Address, gas: 1000000 })
		const erc20Supply = toBn("30000000")
		await sentTx(
			it.testErc20.methods.mint(sender2Address, erc20Supply.toString()),
			{ from: sender1Address, gas: 1000000 }
		)
		await sentTx(
			it.testErc20.methods.mint(sender1Address, "10000000000000000000000000000"),
			{ from: sender1Address, gas: 1000000 }
		)
		console.log("erc20", it.testErc20.options.address)

		const auction = await auctionService.start(
			{
				makeAssetType: {
					assetClass: "ERC1155",
					contract: toAddress(it.testErc1155.options.address),
					tokenId: toBigNumber(tokenId),
				},
				amount: toBigNumber("1"),
				takeAssetType: {
					assetClass: "ERC20",
					contract: toAddress(it.testErc20.options.address),
				},
				minimalStepDecimal: toBigNumber("0.00000000000000001"),
				minimalPriceDecimal: toBigNumber("0.00000000000000005"),
				duration: 1,
				startTime: 0,
				buyOutPriceDecimal: toBigNumber("0.00000000000000009"),
				originFees: [{
					account: toAddress(feeAddress),
					value: 1000,
				}],
			}
		)

		await auction.tx.wait()

		await awaitForAuction(apis.auction, await auction.hash)

		const bidPriceDecimal = toBn("0.00000000000000006")

		const putBidTx = await putBidService.putBid({
			hash: await auction.hash,
			priceDecimal: toBigNumber(bidPriceDecimal.toString()),
			originFees: [{
				account: toAddress(feeAddress),
				value: 1000,
			}],
		})
		await putBidTx.wait()

		await awaitForAuctionBid(apis.auction, await auction.hash)
		await delay(1000)
		const finishAuctionTx = await finishAuction(await auction.hash)
		await finishAuctionTx.wait()

		const feeAddressFinishBidBalance = toBn(await it.testErc20.methods.balanceOf(feeAddress).call())

		expect(await it.testErc1155.methods.balanceOf(sender2Address, tokenId).call()).toBe("1")

		const bidFinishPriceDecimal = toBn("0.000000000000000066")
		const finalBidderErcBalance = erc20Supply.minus(bidFinishPriceDecimal.multipliedBy(toBn(10).pow(18)).toString())
		expect(await it.testErc20.methods.balanceOf(sender2Address).call())
			.toBe(finalBidderErcBalance.toString())
		expect(feeAddressFinishBidBalance.toString()).toBe("12")
	})

	test("finish auction erc-1155 <-> eth", async () => {
		const tokenId = "2"
		await sentTx(it.testErc1155.methods.mint(sender1Address, tokenId, 10, "0x"), { from: sender1Address, gas: 1000000 })
		const erc20Supply = toBn("30000000")
		await sentTx(
			it.testErc20.methods.mint(sender2Address, erc20Supply.toString()),
			{ from: sender1Address, gas: 1000000 }
		)

		const auction = await auctionService.start(
			{
				makeAssetType: {
					assetClass: "ERC1155",
					contract: toAddress(it.testErc1155.options.address),
					tokenId: toBigNumber(tokenId),
				},
				amount: toBigNumber("1"),
				takeAssetType: {
					assetClass: "ETH",
				},
				minimalStepDecimal: toBigNumber("0.00000000000000001"),
				minimalPriceDecimal: toBigNumber("0.00000000000000005"),
				duration: 1,
				startTime: 0,
				buyOutPriceDecimal: toBigNumber("0.00000000000000009"),
				originFees: [{
					account: toAddress(feeAddress),
					value: 1000,
				}],
			}
		)

		await auction.tx.wait()

		await awaitForAuction(apis.auction, await auction.hash)

		const bidPriceDecimal = toBn("0.00000000000000006")

		const putBidTx = await putBidService.putBid({
			hash: await auction.hash,
			priceDecimal: toBigNumber(bidPriceDecimal.toString()),
			originFees: [{
				account: toAddress(feeAddress),
				value: 1000,
			}],
		})
		await putBidTx.wait()

		await awaitForAuctionBid(apis.auction, await auction.hash)
		await delay(1000)
		const finishAuctionTx = await finishAuction(await auction.hash)
		await finishAuctionTx.wait()

		expect(await it.testErc1155.methods.balanceOf(sender2Address, tokenId).call()).toBe("1")

		expect(await web3Buyer.eth.getBalance(feeAddress)).toBe("12")
	})

})
