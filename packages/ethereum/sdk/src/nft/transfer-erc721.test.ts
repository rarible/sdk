import { randomEVMAddress, toEVMAddress } from "@rarible/types"
import type { EVMAddress } from "@rarible/types"
import { awaitAll, deployTestErc721, createGanacheProvider } from "@rarible/ethereum-sdk-test-common"
import { getSendWithInjects } from "../common/send-transaction"
import { sentTx } from "../common/test"
import { createEthereumProviders } from "../common/test/create-test-providers"
import { transferErc721 } from "./transfer-erc721"

const { addresses, provider, wallets } = createGanacheProvider()
const { providers, web3v4 } = createEthereumProviders(provider, wallets[0])

/**
 * @group provider/ganache
 */
describe.each(providers)("transfer Erc721", ethereum => {
  const [from] = addresses
  const to = randomEVMAddress()

  const send = getSendWithInjects()

  const it = awaitAll({
    testErc721: deployTestErc721(web3v4, "TST", "TST"),
  })

  test("should transfer erc721 token", async () => {
    const tokenId = from + "b00000000000000000000001"
    await sentTx(it.testErc721.methods.mint(from, tokenId, "https://example.com"), { from, gas: "500000" })

    const senderBalance = (await it.testErc721.methods.balanceOf(from).call()).toString()
    expect(senderBalance === "1").toBeTruthy()

    const ownership: EVMAddress = await it.testErc721.methods.ownerOf(tokenId).call()
    expect(toEVMAddress(ownership) === toEVMAddress(from)).toBeTruthy()

    const tx = await transferErc721(ethereum, send, toEVMAddress(it.testErc721.options.address!), from, to, tokenId)
    expect(tx).toBeTruthy()
    await tx.wait()

    const receiverOwnership = await it.testErc721.methods.ownerOf(tokenId).call()
    expect(toEVMAddress(receiverOwnership) === toEVMAddress(to)).toBeTruthy()
  })
})
