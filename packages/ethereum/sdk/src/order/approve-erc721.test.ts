import { randomAddress, toAddress } from "@rarible/types"
import { awaitAll, createGanacheProvider, deployTestErc721 } from "@rarible/ethereum-sdk-test-common"
import { getSendWithInjects } from "../common/send-transaction"
import { createTestProviders } from "../common/test/create-test-providers"
import { sentTx } from "../common/test"
import { approveErc721 as approveErc721Template } from "./approve-erc721"

const { provider, addresses, wallets } = createGanacheProvider()
const { providers, web3v4 } = createTestProviders(provider, wallets[0])

/**
 * @group provider/ganache
 */
describe.each(providers)("approveErc721", (ethereum) => {
	const [from] = addresses
	const send = getSendWithInjects()

	const approveErc721 = approveErc721Template.bind(null, ethereum, send)

	const it = awaitAll({
		testErc721: deployTestErc721(web3v4, "TST", "TST"),
	})

	test(`[${ethereum.constructor.name}] should approve`, async () => {
		const tokenId = from + "b00000000000000000000001"
		await sentTx(it.testErc721.methods.mint(from, tokenId, "https://example.com"), { from, gas: "200000" })

		const operator = randomAddress()
		const tx = await approveErc721( toAddress(it.testErc721.options.address!), from, operator)
		await tx?.wait()
		const result: boolean = await it.testErc721.methods.isApprovedForAll(from, operator).call()
		expect(result).toBeTruthy()
	})

	test(`[${ethereum.constructor.name}] should not approve if already approved`, async () => {
		const tokenId = from + "b00000000000000000000002"
		await sentTx(it.testErc721.methods.mint(from, tokenId, "https://example.com"), { from, gas: "200000" })

		const operator = randomAddress()
		await sentTx(it.testErc721.methods.setApprovalForAll(operator, true), { from })
		const result = await approveErc721( toAddress(it.testErc721.options.address!), from, operator)

		expect(result === undefined).toBeTruthy()
	})
})
