import { awaitAll, deployTestErc1155, createAuctionContract } from "@rarible/ethereum-sdk-test-common"
import { toAddress, toBigNumber } from "@rarible/types"
import { getSimpleSendWithInjects } from "../common/send-transaction"
import { getEthereumConfig } from "../config"
import { approve as approveTemplate } from "../order/approve"
import { createEthereumApis } from "../common/apis"
import { getNetworkFromChainId } from "../common"
import { sentTx } from "../common/test"
import { createE2eTestProvider } from "../common/test/create-test-providers"
import { StartAuction } from "./start"
import { cancelAuction } from "./cancel"
import { awaitForAuction } from "./test"

describe.skip("cancel auction", () => {
	const { wallet, web3Ethereum: ethereum1, web3v4 } = createE2eTestProvider("0x00120de4b1518cf1f16dc1b02f6b4a8ac29e870174cb1d8575f578480930250a")
	const sender1Address = wallet.getAddressString()
	const config = getEthereumConfig("testnet")
	const getConfig = async () => config

	const send = getSimpleSendWithInjects()
	const approve1 = approveTemplate.bind(null, ethereum1, send, getConfig)
	const apis = createEthereumApis("testnet")
	const getApis = async () => {
		const chainId = await ethereum1.getChainId()
		const env = getNetworkFromChainId(chainId)
		return createEthereumApis(env)
	}
	const auctionService = new StartAuction(ethereum1, send, getConfig, "testnet", approve1, getApis)

	const it = awaitAll({
		testErc1155: deployTestErc1155(web3v4, "TST"),
	})

	test("cancel auction", async () => {

		await sentTx(it.testErc1155.methods.mint(sender1Address, 1, 10, "0x"), { from: sender1Address })

		const auction = await auctionService.start({
			makeAssetType: {
				assetClass: "ERC1155",
				contract: toAddress(it.testErc1155.options.address!),
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
			buyOutPriceDecimal: toBigNumber("0.0000000000000001"),
			originFees: [],
		})

		await auction.tx.wait()

		await awaitForAuction(apis.auction, await auction.hash)

		const auctionContract = createAuctionContract(web3v4, config.auction)

		const tx = await cancelAuction(ethereum1, send, getConfig, getApis, await auction.hash)
		await tx.wait()

		const auctionExistence = await auctionContract.methods.checkAuctionExistence(await auction.auctionId).call()
		expect(auctionExistence).toBe(false)
	})
})
