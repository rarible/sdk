import { awaitAll, deployCryptoPunks, createGanacheProvider } from "@rarible/ethereum-sdk-test-common"
import { toAddress } from "@rarible/types"
import { getSendWithInjects } from "../common/send-transaction"
import { sentTx } from "../common/test"
import { createTestProviders } from "../common/test/create-test-providers"
import { transferCryptoPunk } from "./transfer-crypto-punk"

const {	addresses, provider, wallets } = createGanacheProvider()
const { providers, web3v4 } = createTestProviders(provider, wallets[0])

describe.each(providers)("transfer crypto punks", (ethereumSeller) => {
	const [sellerAddress, receipentAddress] = addresses

	const it = awaitAll({
		punksMarket: deployCryptoPunks(web3v4),
	})

	const send = getSendWithInjects()

	beforeAll(async () => {
		await sentTx(it.punksMarket.methods.allInitialOwnersAssigned(), { from: sellerAddress })
		//Mint punk with index=0
		await sentTx(it.punksMarket.methods.getPunk(0), { from: sellerAddress })
	})

	test("should transfer crypto punk token", async () => {
		const tx = await transferCryptoPunk(
			ethereumSeller,
			send,
			toAddress(it.punksMarket.options.address!),
			toAddress(receipentAddress),
			0
		)
		await tx.wait()

		const punkOwnerAddress = await it.punksMarket.methods.punkIndexToAddress(0).call()
		expect(punkOwnerAddress.toLowerCase()).toBe(receipentAddress.toLowerCase())
	})

})
