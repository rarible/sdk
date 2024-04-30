import { randomAddress, toAddress } from "@rarible/types"
import { awaitAll, deployTestErc20, createGanacheProvider } from "@rarible/ethereum-sdk-test-common"
import { toBn } from "@rarible/utils/build/bn"
import type { Ethereum } from "@rarible/ethereum-provider"
import { getSendWithInjects } from "../common/send-transaction"
import { createEthereumProviders } from "../common/test/create-test-providers"
import { sentTx } from "../common/test"
import { approveErc20 as approveErc20Template } from "./approve-erc20"
import { prependProviderName } from "./test/prepend-provider-name"

const pk = "d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469"
const { provider, addresses, wallets } = createGanacheProvider(pk)
const { providers, web3v4 } = createEthereumProviders(provider, wallets[0])

/**
 * @group provider/ganache
 */
describe.each(providers)("approveErc20", (ethereum: Ethereum) => {
	const [testAddress] = addresses

	const send = getSendWithInjects()
	const approveErc20 = approveErc20Template.bind(null, ethereum, send)

	const it = awaitAll({
		testErc20: deployTestErc20(web3v4, "TST", "TST"),
	})

	beforeAll(async () => {
		await it.testErc20.methods.mint(testAddress, 100).send({ from: testAddress, gas: "200000" })
	})

	test(prependProviderName(ethereum, "should approve exact value if not infinite"), async () => {
		const operator = randomAddress()
		const tx = await approveErc20(toAddress(it.testErc20.options.address!), testAddress, operator, toBn(100), false)
		await tx?.wait()
		const result = toBn(await it.testErc20.methods.allowance(testAddress, operator).call())
		expect(result.eq(100)).toBeTruthy()
	})

	test(prependProviderName(ethereum, "should approve if value infinite"), async () => {
		const infiniteBn = toBn(2).pow(256).minus(1)

		const operator = randomAddress()
		const addressErc20 = toAddress(it.testErc20.options.address!)
		const tx = await approveErc20(addressErc20, testAddress, operator, toBn(infiniteBn), true)
		await tx?.wait()
		const result = toBn(await it.testErc20.methods.allowance(testAddress, operator).call())
		expect(result.toString()).toBe(infiniteBn.toString())
	})

	test(prependProviderName(ethereum, "should not approve if already approved"), async () => {
		const operator = randomAddress()
		const testBnValue = 200

		await sentTx(it.testErc20.methods.approve(operator, testBnValue), { from: testAddress })

		const result = await approveErc20(
			toAddress(it.testErc20.options.address!),
			testAddress,
			operator,
			toBn(testBnValue),
			false
		)

		expect(result === undefined).toBeTruthy()
	})
})
