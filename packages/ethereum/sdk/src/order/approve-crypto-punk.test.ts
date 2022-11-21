import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3"
import { awaitAll, createGanacheProvider, deployCryptoPunks } from "@rarible/ethereum-sdk-test-common"
import { Configuration, GatewayControllerApi } from "@rarible/ethereum-api-client"
import { randomAddress, toAddress } from "@rarible/types"
import { getSendWithInjects, sentTx } from "../common/send-transaction"
import { getApiConfig } from "../config/api-config"
import { getEthereumConfig } from "../config"
import { approveCryptoPunk } from "./approve-crypto-punk"
import { checkChainId } from "./check-chain-id"

describe("approve crypto punks", () => {
	const {
		addresses,
		provider,
	} = createGanacheProvider()
	const [sellerAddress] = addresses
	const web3 = new Web3(provider as any)
	const ethereumSeller = new Web3Ethereum({ web3, from: sellerAddress, gas: 1000000 })

	const it = awaitAll({
		punksMarket: deployCryptoPunks(web3),
	})

	const configuration = new Configuration(getApiConfig("dev-ethereum"))
	const gatewayApi = new GatewayControllerApi(configuration)

	const config = getEthereumConfig("dev-ethereum")
	const checkWalletChainId = checkChainId.bind(null, ethereumSeller, config)
	const send = getSendWithInjects().bind(null, gatewayApi, checkWalletChainId)
	const approve = approveCryptoPunk.bind(null, ethereumSeller, send)

	beforeAll(async () => {
		await sentTx(it.punksMarket.methods.allInitialOwnersAssigned(), { from: sellerAddress })
		await sentTx(it.punksMarket.methods.getPunk(0), { from: sellerAddress })
	})

	test("should approve", async () => {
		const operator = randomAddress()

		const tx = await approve(
			toAddress(it.punksMarket.options.address),
			sellerAddress,
			operator,
			0
		)
		await tx?.wait()
		const offer = await it.punksMarket.methods.punksOfferedForSale(0).call()

		expect(offer.isForSale).toBe(true)
		expect(offer.punkIndex).toBe("0")
		expect(offer.seller.toLowerCase()).toBe(sellerAddress.toLowerCase())
		expect(offer.minValue).toBe("0")
		expect(offer.onlySellTo.toLowerCase()).toBe(operator.toLowerCase())
	})

	test("should not approve if already approved", async () => {
		const operator = randomAddress()

		await sentTx(
			it.punksMarket.methods.offerPunkForSaleToAddress(0, 0, operator),
			{ from: sellerAddress }
		)

		const approveResult = await approve(
			toAddress(it.punksMarket.options.address),
			sellerAddress,
			operator,
			0
		)

		expect(approveResult === undefined).toBeTruthy()
	})
})
