import { randomAddress, toAddress } from "@rarible/types"
import { createGanacheProvider, deployTestErc1155 } from "@rarible/ethereum-sdk-test-common"
import type { testErc1155Abi } from "@rarible/ethereum-sdk-test-common"
import { fromUtf8 } from "ethereumjs-util"
import type { Web3EthContractTypes } from "@rarible/web3-v4-ethereum"
import { getSendWithInjects } from "../common/send-transaction"
import { sentTx } from "../common/test"
import { createEthereumProviders } from "../common/test/create-test-providers"
import { approveErc1155 as approveErc1155Template } from "./approve-erc1155"

const pk = "d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469"
const { provider, addresses, wallets } = createGanacheProvider(pk)
const { providers, web3v4 } = createEthereumProviders(provider, wallets[0])

/**
 * @group provider/ganache
 */
describe.each(providers)("approveErc1155", (ethereum) => {
	const [testAddress] = addresses
	const send = getSendWithInjects()
	const approveErc1155 = approveErc1155Template.bind(null, ethereum, send)

	let testErc1155: Web3EthContractTypes.Contract<typeof testErc1155Abi>
	beforeAll(async () => {
		testErc1155 = await deployTestErc1155(web3v4, "TST")
	})

	test(`[${ethereum.constructor.name}] should approve`, async () => {
		const tokenId = testAddress + "b00000000000000000000003"
		await sentTx(testErc1155.methods.mint(testAddress, tokenId, 1, fromUtf8("123")), { from: testAddress, gas: "200000" })

		const balance = await testErc1155.methods.balanceOf(testAddress, tokenId).call()
		expect(balance.toString()).toEqual("1")

		const operator = randomAddress()
		await approveErc1155(toAddress(testErc1155.options.address!), testAddress, operator)

		const result: boolean = await testErc1155.methods.isApprovedForAll(testAddress, operator).call()
		expect(result).toBeTruthy()
	})

	test(`[${ethereum.constructor.name}] should not approve if already approved`, async () => {
		const tokenId = testAddress + "b00000000000000000000002"
		await testErc1155.methods.mint(testAddress, tokenId, 5, fromUtf8("123")).send({ from: testAddress, gas: "200000" })

		const balance = await testErc1155.methods.balanceOf(testAddress, tokenId).call()
		expect(balance.toString()).toEqual("5")

		const operator = randomAddress()
		await sentTx(testErc1155.methods.setApprovalForAll(operator, true), { from: testAddress })
		const result = await approveErc1155(toAddress(testErc1155.options.address!), testAddress, operator)

		expect(result === undefined).toBeTruthy()
	})
})
