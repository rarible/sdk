import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { toContractAddress } from "@rarible/types"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { createRaribleSdk } from "../../../index"
import { initProviders } from "../test/init-providers"
import { convertEthereumContractAddress, convertEthereumToUnionAddress } from "../common"
import { MintType } from "../../../types/nft/mint/domain"
import { awaitAuction } from "../test/await-auction"

describe("start auction", () => {
	const {
		web31,
		wallet1,
		web32,
		wallet2,
	} = initProviders({
		pk1: undefined,
		pk2: "ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9",
	})

	const ethereum1 = new Web3Ethereum({
		web3: web31,
		gas: 1000000,
	})
	const ethwallet1 = new EthereumWallet(ethereum1)
	const sdk1 = createRaribleSdk(ethwallet1, "e2e")

	const ethereum2 = new Web3Ethereum({
		web3: web32,
		gas: 1000000,
	})
	const ethwallet2 = new EthereumWallet(ethereum2)
	const sdk2 = createRaribleSdk(ethwallet2, "e2e")

	const testErc721Contract = convertEthereumContractAddress("0x4092e1a67FBE94F1e806Fb9f93F956Fee0093A31", Blockchain.ETHEREUM)
	const testErc1155Contract = convertEthereumContractAddress("0x3D614ceC0d5E25adB35114b7dC2107D6F054581f", Blockchain.ETHEREUM)

	const it = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
	})

	test("finish auction erc-1155 <-> erc-20", async () => {
		const mintAction = await sdk1.nft.mint({ collectionId: testErc721Contract })
		const mintResponse = await mintAction.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumToUnionAddress(await ethwallet1.ethereum.getFrom(), Blockchain.ETHEREUM),
				value: 10000,
			}],
			lazyMint: false,
			supply: 1,
		})
		await sentTx(
			it.testErc20.methods.mint(sender2Address, erc20Supply.toString()),
			{ from: sender1Address, gas: 1000000 }
		)

		const auctionPrepareResponse = await sdk1.auction.start({ collectionId: testErc1155Contract })
		const response = await auctionPrepareResponse.submit({
			itemId: mintResponse.itemId,
			amount: 1,
			currency: {
				"@type": "ERC20",
				contract: toContractAddress(),
			},
			minimalStep: "0.00000000000000001",
			minimalPrice: "0.00000000000000005",
			duration: 1000,
			startTime: 0,
			buyOutPrice: "0.00000000000000010",
			originFees: [],
			payouts: [],
		})
		const auction = await sdk1.auction.start(
			{
				makeAssetType: {
					assetClass: "ERC1155",
					contract: (it.testErc1155.options.address),
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
