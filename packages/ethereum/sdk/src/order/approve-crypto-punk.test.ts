import { awaitAll, createGanacheProvider, deployCryptoPunks } from "@rarible/ethereum-sdk-test-common"
import { randomAddress, toAddress } from "@rarible/types"
import { getSendWithInjects } from "../common/send-transaction"
import { createTestProviders, excludeProviders } from "../common/test/create-test-providers"
import { sentTx } from "../common/test"
import { approveCryptoPunk } from "./approve-crypto-punk"

const { addresses, provider, wallets } = createGanacheProvider()
const { providers, web3v4 } = createTestProviders(provider, wallets[0])
//@todo some tests don't work with ethers providers, need to fix
const filteredProviders = excludeProviders(providers, ["EthersEthereum", "EthersWeb3ProviderEthereum"])
describe.each(filteredProviders)("approve crypto punks", (ethereumSeller) => {
	const [sellerAddress] = addresses

	const it = awaitAll({
		punksMarket: deployCryptoPunks(web3v4),
	})

	const send = getSendWithInjects()
	const approve = approveCryptoPunk.bind(null, ethereumSeller, send)

	beforeAll(async () => {
		await sentTx(it.punksMarket.methods.allInitialOwnersAssigned(), { from: sellerAddress })
		await sentTx(it.punksMarket.methods.getPunk(0), { from: sellerAddress })
	})

	test(`[${ethereumSeller.constructor.name}] should approve`, async () => {
		const operator = randomAddress()

		const tx = await approve(
			toAddress(it.punksMarket.options.address!),
			sellerAddress,
			operator,
			0
		)
		await tx?.wait()
		const offer = await it.punksMarket.methods.punksOfferedForSale(0).call()

		expect(offer.isForSale).toBe(true)
		expect(offer.punkIndex.toString()).toBe("0")
		expect(offer.seller.toLowerCase()).toBe(sellerAddress.toLowerCase())
		expect(offer.minValue.toString()).toBe("0")
		expect(offer.onlySellTo.toLowerCase()).toBe(operator.toLowerCase())
	})

	test(`[${ethereumSeller.constructor.name}] should not approve if already approved`, async () => {
		const operator = randomAddress()

		await sentTx(
			it.punksMarket.methods.offerPunkForSaleToAddress(0, 0, operator),
			{ from: sellerAddress }
		)

		const approveResult = await approve(
			toAddress(it.punksMarket.options.address!),
			sellerAddress,
			operator,
			0
		)

		expect(approveResult === undefined).toBeTruthy()
	})
})
