import { awaitAll, createGanacheProvider, deployTestErc20 } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { toAddress } from "@rarible/types"
import { getPrice, getPriceDecimal } from "./get-price"
import { createTestProviders } from "./test/create-test-providers"
import { sentTx } from "./send-transaction"

const { provider, addresses, wallets } = createGanacheProvider()
const { providers } = createTestProviders(provider, wallets[0])
const [address] = addresses
const web3 = new Web3(provider)

/**
 * @group provider/dev
 */
describe.each(providers)("get price test", (ethereum) => {
	const it = awaitAll({
		testErc20: deployTestErc20(web3, "TST", "TST"),
	})

	beforeAll(async () => {
		await sentTx(it.testErc20.methods
			.mint(it.testErc20.options.address, 100), {
			from: address,
			gas: 200000,
		})
	})

	test("get price", async () => {
		const value = await getPrice(ethereum, {
			assetClass: "ERC20",
			contract: toAddress(it.testErc20.options.address),
		}, "0.000000000000000002")
		expect(value.toString()).toEqual("2")
	})

	test("get price decimal", async () => {
		const value = await getPriceDecimal(ethereum, {
			assetClass: "ERC20",
			contract: toAddress(it.testErc20.options.address),
		}, "100000000000000000")
		expect(value.toString()).toEqual("0.1")
	})
})
