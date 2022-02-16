import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { awaitAll, deployTestErc20 } from "@rarible/ethereum-sdk-test-common"
import { createRaribleSdk } from "../../../index"
import { initProvider, initProviders } from "../test/init-providers"
import { convertEthereumContractAddress, convertEthereumToUnionAddress } from "../common"
import { awaitAuction } from "../test/await-auction"
import { delay, retry } from "../../../common/retry"
import { awaitForAuctionBid } from "../test/await-auction-bid"

describe("start, put bid and finish auction", () => {
	const {
		web31,
		wallet1,
		web32,
		wallet2,
	} = initProviders({
		pk1: undefined,
		pk2: "ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9",
	})
	const { wallet: feeWallet } = initProvider()

	const feeAddress = feeWallet.getAddressString()
	const feeUnionAddress = convertEthereumToUnionAddress(feeAddress, Blockchain.ETHEREUM)
	const ethereum1 = new Web3Ethereum({
		web3: web31,
		gas: 1000000,
	})
	const ethwallet1 = new EthereumWallet(ethereum1)
	const sdkSeller = createRaribleSdk(ethwallet1, "e2e")

	const ethereum2 = new Web3Ethereum({
		web3: web32,
		gas: 1000000,
	})
	const ethwallet2 = new EthereumWallet(ethereum2)
	const sdkBuyer = createRaribleSdk(ethwallet2, "e2e")

	const testErc721Contract = convertEthereumContractAddress("0x4092e1a67FBE94F1e806Fb9f93F956Fee0093A31", Blockchain.ETHEREUM)
	const testErc1155Contract = convertEthereumContractAddress("0x3D614ceC0d5E25adB35114b7dC2107D6F054581f", Blockchain.ETHEREUM)

	const it = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
	})

	test("finish auction erc-721 <-> erc-20", async () => {
		const mintAction = await sdkSeller.nft.mint({ collectionId: testErc721Contract })
		const mintResponse = await mintAction.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumToUnionAddress(await ethwallet1.ethereum.getFrom(), Blockchain.ETHEREUM),
				value: 10000,
			}],
			lazyMint: false,
			supply: 1,
		})

		await it.testErc20.methods.mint(wallet2.getAddressString(), "2000000").send({ from: wallet1.getAddressString(), gas: 1000000 })

		const auctionPrepareResponse = await sdkSeller.auction.start({ collectionId: testErc721Contract })
		const startResponse = await auctionPrepareResponse.submit({
			itemId: mintResponse.itemId,
			amount: 1,
			currency: {
				"@type": "ERC20",
				contract: convertEthereumContractAddress(it.testErc20.options.address, Blockchain.ETHEREUM),
			},
			minimalStep: "0.00000000000000001",
			minimalPrice: "0.00000000000000005",
			duration: 1,
			startTime: 0,
			buyOutPrice: "0.00000000000000009",
			originFees: [{
				account: feeUnionAddress,
				value: 1000,
			}],
		})

		await startResponse.tx.wait()

		const auctionId = await startResponse.auctionId
		await awaitAuction(sdkSeller, auctionId)

		const bidPriceDecimal = "0.00000000000000006"

		const putBidTx = await sdkBuyer.auction.putBid({
			auctionId: await auctionId,
			price: bidPriceDecimal,
			originFees: [{
				account: feeUnionAddress,
				value: 1000,
			}],
		})
		await putBidTx.wait()

		await awaitForAuctionBid(sdkBuyer, auctionId)
	})

	test("finish auction erc-1155 <-> eth", async () => {
		const mintAction = await sdkSeller.nft.mint({ collectionId: testErc1155Contract })
		const mintResponse = await mintAction.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumToUnionAddress(await ethwallet1.ethereum.getFrom(), Blockchain.ETHEREUM),
				value: 10000,
			}],
			lazyMint: false,
			supply: 5,
		})

		const auctionPrepareResponse = await sdkSeller.auction.start({ collectionId: testErc1155Contract })
		const startResponse = await auctionPrepareResponse.submit({
			itemId: mintResponse.itemId,
			amount: 2,
			currency: { "@type": "ETH" },
			minimalStep: "0.00000000000000001",
			minimalPrice: "0.00000000000000005",
			duration: 1,
			startTime: 0,
			buyOutPrice: "0.00000000000000009",
			originFees: [{
				account: feeUnionAddress,
				value: 1000,
			}],
		})

		await startResponse.tx.wait()

		const auctionId = await startResponse.auctionId
		await awaitAuction(sdkSeller, auctionId)

		const bidPriceDecimal = "0.00000000000000006"

		const putBidTx = await sdkBuyer.auction.putBid({
			auctionId: await auctionId,
			price: bidPriceDecimal,
			originFees: [{
				account: feeUnionAddress,
				value: 1000,
			}],
		})
		await putBidTx.wait()

		await awaitForAuctionBid(sdkBuyer, auctionId)
		await delay(1000)
		const finishAuctionTx = await sdkSeller.auction.finish({ auctionId })
		await finishAuctionTx.wait()

		await retry(5, 2000, async () => {
			const ownership = await sdkSeller.apis.ownership.getOwnershipById({
				ownershipId: `${mintResponse.itemId}:${await ethereum2.getFrom()}`,
			})
			if (ownership.value !== "2") {
				throw new Error("Ownership value should be equal to 2")
			}
		})

	})


})
