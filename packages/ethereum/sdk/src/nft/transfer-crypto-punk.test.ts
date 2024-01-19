import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3"
import { awaitAll, deployCryptoPunks, createGanacheProvider } from "@rarible/ethereum-sdk-test-common"
import { toAddress } from "@rarible/types"
import { getSendWithInjects, sentTx } from "../common/send-transaction"
import { transferCryptoPunk } from "./transfer-crypto-punk"

describe("transfer crypto punks", () => {
	const {
		addresses,
		provider,
	} = createGanacheProvider()
	const [sellerAddress, receipentAddress] = addresses
	const web3 = new Web3(provider as any)
	const ethereumSeller = new Web3Ethereum({ web3, from: sellerAddress, gas: 1000000 })

	const it = awaitAll({
		punksMarket: deployCryptoPunks(web3),
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
