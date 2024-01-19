import { randomAddress, toAddress } from "@rarible/types"
import type { Contract } from "web3-eth-contract"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { createGanacheProvider, deployTestErc1155 } from "@rarible/ethereum-sdk-test-common"
import type { testErc1155Abi } from "@rarible/ethereum-sdk-test-common/src"
import { fromUtf8 } from "ethereumjs-util"
import { getSendWithInjects, sentTx } from "../common/send-transaction"
import { approveErc1155 as approveErc1155Template } from "./approve-erc1155"

describe("approveErc1155", () => {
	const { provider, addresses } = createGanacheProvider(
		"d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469"
	)
	const web3 = new Web3(provider as any)
	const ethereum = new Web3Ethereum({ web3 })
	const [testAddress] = addresses
	const send = getSendWithInjects()
	const approveErc1155 = approveErc1155Template.bind(null, ethereum, send)

	let testErc1155: Contract<typeof testErc1155Abi>
	beforeAll(async () => {
		testErc1155 = await deployTestErc1155(web3, "TST")
	})

	test("should approve", async () => {
		const tokenId = testAddress + "b00000000000000000000003"
		await sentTx(testErc1155.methods.mint(testAddress, tokenId, 1, fromUtf8("123")), { from: testAddress, gas: "200000" })

		const balance = await testErc1155.methods.balanceOf(testAddress, tokenId).call()
		expect(balance.toString()).toEqual("1")

		const operator = randomAddress()
		await approveErc1155(toAddress(testErc1155.options.address!), testAddress, operator)

		const result: boolean = await testErc1155.methods.isApprovedForAll(testAddress, operator).call()
		expect(result).toBeTruthy()
	})

	test("should not approve if already approved", async () => {
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
