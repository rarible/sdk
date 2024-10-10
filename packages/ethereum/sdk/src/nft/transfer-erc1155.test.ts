import { randomEVMAddress, toEVMAddress } from "@rarible/types"
import { awaitAll, deployTestErc1155, createGanacheProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { ethers } from "ethers"
import { EthersEthereum, EthersWeb3ProviderEthereum } from "@rarible/ethers-ethereum"
import type { Ethereum } from "@rarible/ethereum-provider"
import { isError } from "../common/is-error"
import { getSendWithInjects, sentTx } from "../common/send-transaction"
import { prependProviderName } from "../order/test/prepend-provider-name"
import { transferErc1155 } from "./transfer-erc1155"

const { provider, addresses, accounts } = createGanacheProvider()
const ethersWeb3Provider = new ethers.providers.Web3Provider(provider as any)
const web3 = new Web3(provider as any)
const [account1] = accounts

const providers = [
  new Web3Ethereum({ web3, gas: 500000 }),
  new EthersEthereum(new ethers.Wallet(account1.secretKey, ethersWeb3Provider)),
  new EthersWeb3ProviderEthereum(ethersWeb3Provider),
]

/**
 * @group provider/ganache
 */
describe.each(providers)("transfer Erc1155", (ethereum: Ethereum) => {
  const [from] = addresses
  const to = randomEVMAddress()

  const send = getSendWithInjects()

  const it = awaitAll({
    testErc1155: deployTestErc1155(web3, "TST"),
  })

  test(prependProviderName(ethereum, "should transfer erc1155 token"), async () => {
    const token1Id = from + "b00000000000000000000001"
    const token1Balance = "10"
    await sentTx(it.testErc1155.methods.mint(from, token1Id, token1Balance, "123"), { from, gas: 200000 })

    const senderBalance: string = await it.testErc1155.methods.balanceOf(from, token1Id).call()
    expect(senderBalance === token1Balance).toBeTruthy()

    console.log("before transfer")
    const hash = await transferErc1155(
      ethereum,
      send,
      toEVMAddress(it.testErc1155.options.address),
      from,
      to,
      token1Id,
      "5",
    )
    await hash.wait()
    expect(!!hash).toBeTruthy()

    console.log("after transfer")
    const senderResultBalance: string = await it.testErc1155.methods.balanceOf(from, token1Id).call()
    expect(senderResultBalance === "5").toBeTruthy()

    const receiverBalance: string = await it.testErc1155.methods.balanceOf(to, token1Id).call()
    expect(receiverBalance === "5").toBeTruthy()
  })

  test(prependProviderName(ethereum, "should transfer batch of erc1177"), async () => {
    const [token2Id, token3Id, token4Id]: string[] = [
      from + "b00000000000000000000002",
      from + "b00000000000000000000003",
      from + "b00000000000000000000004",
    ]
    const [token2Balance, token3Balance, token4Balance]: string[] = ["100", "200", "300"]
    await sentTx(it.testErc1155.methods.mint(from, token2Id, token2Balance, "123"), { from: from, gas: 200000 })
    await sentTx(it.testErc1155.methods.mint(from, token3Id, token3Balance, "123"), { from: from, gas: 200000 })
    await sentTx(it.testErc1155.methods.mint(from, token4Id, token4Balance, "123"), { from: from, gas: 200000 })

    const [token2Balances, token3Balances, token4Balances] = [
      await it.testErc1155.methods.balanceOfBatch([from, to], [token2Id, token2Id]).call(),
      await it.testErc1155.methods.balanceOfBatch([from, to], [token3Id, token3Id]).call(),
      await it.testErc1155.methods.balanceOfBatch([from, to], [token4Id, token4Id]).call(),
    ]
    expect(token2Balances).toEqual(["100", "0"])
    expect(token3Balances).toEqual(["200", "0"])
    expect(token4Balances).toEqual(["300", "0"])

    const hash = await transferErc1155(
      ethereum,
      send,
      toEVMAddress(it.testErc1155.options.address),
      from,
      to,
      [token2Id, token3Id, token4Id],
      ["10", "100", "300"],
    )
    expect(!!hash).toBeTruthy()
    await hash.wait()

    const [resultToken2Balances, resultToken3Balances, resultToken4Balances] = [
      await it.testErc1155.methods.balanceOfBatch([from, to], [token2Id, token2Id]).call(),
      await it.testErc1155.methods.balanceOfBatch([from, to], [token3Id, token3Id]).call(),
      await it.testErc1155.methods.balanceOfBatch([from, to], [token4Id, token4Id]).call(),
    ]

    expect(resultToken2Balances).toEqual(["90", "10"])
    expect(resultToken3Balances).toEqual(["100", "100"])
    expect(resultToken4Balances).toEqual(["0", "300"])
  })

  test(
    prependProviderName(
      ethereum,
      "the transferErc1155 should throw error, because the length of identifiers and quantities, the parameters of the sum do not match",
    ),
    async () => {
      const [token2Id, token3Id]: string[] = [from + "b00000000000000000000005", from + "b00000000000000000000006"]
      const [token2Balance, token3Balance]: string[] = ["100", "100"]
      await sentTx(it.testErc1155.methods.mint(from, token2Id, token2Balance, "123"), { from: from, gas: 200000 })
      await sentTx(it.testErc1155.methods.mint(from, token3Id, token3Balance, "123"), { from: from, gas: 200000 })

      const [token2Balances, token3Balances] = [
        await it.testErc1155.methods.balanceOfBatch([from, to], [token2Id, token2Id]).call(),
        await it.testErc1155.methods.balanceOfBatch([from, to], [token3Id, token3Id]).call(),
      ]
      expect(token2Balances).toEqual(["100", "0"])
      expect(token3Balances).toEqual(["100", "0"])
      expect.assertions(3)
      try {
        await transferErc1155(
          ethereum,
          send,
          toEVMAddress(it.testErc1155.options.address),
          from,
          to,
          [token2Id, token3Id],
          ["50", "50", "10"],
        )
      } catch (e) {
        if (isError(e)) {
          expect(e.message).toEqual("Length of token amounts and token id's isn't equal")
        } else {
          throw new Error("Never happen")
        }
      }
    },
  )
})
