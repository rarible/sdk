import { randomAddress, toAddress } from "@rarible/types"
import type { Address } from "@rarible/ethereum-api-client"
import { awaitAll, deployTestErc721, createGanacheProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { getSendWithInjects, sentTx } from "../common/send-transaction"
import { transferErc721 } from "./transfer-erc721"

describe("transfer Erc721", () => {
	const { provider, addresses } = createGanacheProvider()
	const web3 = new Web3(provider as any)
	const ethereum = new Web3Ethereum({ web3, gas: 200000 })
	const [from] = addresses
	const to = randomAddress()

	const send = getSendWithInjects()

	const it = awaitAll({
		testErc721: deployTestErc721(web3, "TST", "TST"),
	})

	test("should transfer erc721 token", async () => {
		const tokenId = from + "b00000000000000000000001"
		await sentTx(it.testErc721.methods.mint(from, tokenId, "https://example.com"), { from, gas: "500000" })

		const senderBalance = (await it.testErc721.methods.balanceOf(from).call()).toString()
		expect(senderBalance === "1").toBeTruthy()

		const ownership: Address = await it.testErc721.methods.ownerOf(tokenId).call()
		expect(toAddress(ownership) === toAddress(from)).toBeTruthy()

		const tx = await transferErc721(ethereum, send, toAddress(it.testErc721.options.address!), from, to, tokenId)
		expect(tx).toBeTruthy()
		await tx.wait()

		const receiverOwnership = await it.testErc721.methods.ownerOf(tokenId).call()
		expect(toAddress(receiverOwnership) === toAddress(to)).toBeTruthy()
	})

})
