import {
	awaitAll,
	createGanacheProvider,
	deployCryptoPunksMarketV1,
	deployCryptoPunksWrapper,
} from "@rarible/ethereum-sdk-test-common"
import { toAddress } from "@rarible/types"
import { Web3v4Ethereum } from "@rarible/web3-v4-ethereum"
import { getEthereumConfig } from "../config"
import { getSendWithInjects } from "../common/send-transaction"
import { sentTx } from "../common/test"
import { approveForWrapper, unwrapPunk, wrapPunk } from "./cryptopunk-wrapper"

/**
 * @group chain/ganache
 */
describe.skip("wrap crypto punk", () => {
	const { addresses, web3 } = createGanacheProvider()

	const config = getEthereumConfig("dev-ethereum")
	const getConfig = async () => config

	// @ts-ignore
	const ethereum = new Web3v4Ethereum({ web3 })
	const send = getSendWithInjects()

	const it = awaitAll({
		punksMarket: deployCryptoPunksMarketV1(web3),
		punksWrapper: deployCryptoPunksWrapper(web3),
	})

	beforeAll(async () => {
		config.cryptoPunks.marketContract = toAddress(it.punksMarket.options.address!)
		config.cryptoPunks.wrapperContract = toAddress(it.punksWrapper.options.address!)
	})

	const punkId = 3490

	test("should wrap cryptopunk", async () => {
		console.log("market:", (it.punksMarket as any)._address)
		console.log("wrapper:", (it.punksWrapper as any)._address)

		await sentTx(it.punksMarket.methods.getPunk(punkId), { from: addresses[0] })

		console.log(addresses[0], await it.punksMarket.methods.punkIndexToAddress(punkId).call())

		try {
			const apTx = await approveForWrapper(
				ethereum,
				send,
				getConfig,
				punkId
			)

			if (apTx) {
				await apTx.wait()
				expect(apTx.hash).toBeTruthy()
			}
		} catch (e) { console.log ("skip approve", e) }

		const wrapTx = await wrapPunk(
			ethereum,
			send,
			getConfig,
			punkId,
		)

		await wrapTx.wait()
		console.log(wrapTx.hash)
		expect(wrapTx.hash).toBeTruthy()
	})

	test("should unwrap cryptopunk", async () => {
		const tx = await unwrapPunk(
			ethereum,
			send,
			getConfig,
			punkId,
		)

		await tx.wait()

		expect(tx.hash).toBeTruthy()
	})
})
