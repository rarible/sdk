import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3"
import { awaitAll, createGanacheProvider, deployCryptoPunks } from "@rarible/ethereum-sdk-test-common"
import { randomEVMAddress, toEVMAddress } from "@rarible/types"
import { getSendWithInjects, sentTx } from "../common/send-transaction"
import { approveCryptoPunk } from "./approve-crypto-punk"

/**
 * @group provider/ganache
 */
describe("approve crypto punks", () => {
  const { addresses, provider } = createGanacheProvider()
  const [sellerAddress] = addresses
  const web3 = new Web3(provider as any)
  const ethereumSeller = new Web3Ethereum({ web3, from: sellerAddress, gas: 1000000 })

  const it = awaitAll({
    punksMarket: deployCryptoPunks(web3),
  })

  const send = getSendWithInjects()
  const approve = approveCryptoPunk.bind(null, ethereumSeller, send)

  beforeAll(async () => {
    await sentTx(it.punksMarket.methods.allInitialOwnersAssigned(), { from: sellerAddress })
    await sentTx(it.punksMarket.methods.getPunk(0), { from: sellerAddress })
  })

  test("should approve", async () => {
    const operator = randomEVMAddress()

    const tx = await approve(toEVMAddress(it.punksMarket.options.address), sellerAddress, operator, 0)
    await tx?.wait()
    const offer = await it.punksMarket.methods.punksOfferedForSale(0).call()

    expect(offer.isForSale).toBe(true)
    expect(offer.punkIndex).toBe("0")
    expect(offer.seller.toLowerCase()).toBe(sellerAddress.toLowerCase())
    expect(offer.minValue).toBe("0")
    expect(offer.onlySellTo.toLowerCase()).toBe(operator.toLowerCase())
  })

  test("should not approve if already approved", async () => {
    const operator = randomEVMAddress()

    await sentTx(it.punksMarket.methods.offerPunkForSaleToAddress(0, 0, operator), { from: sellerAddress })

    const approveResult = await approve(toEVMAddress(it.punksMarket.options.address), sellerAddress, operator, 0)

    expect(approveResult === undefined).toBeTruthy()
  })
})
