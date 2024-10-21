import { awaitAll, createGanacheProvider, deployCryptoPunks, DEV_PK_5 } from "@rarible/ethereum-sdk-test-common"
import { randomEVMAddress, toEVMAddress } from "@rarible/types"
import type { Ethereum } from "@rarible/ethereum-provider"
import { getSendWithInjects } from "../common/send-transaction"
import { sentTx } from "../common/test"
import { createEthereumProviders } from "../common/test/create-test-providers"
import { delay } from "../common/retry"
import { approveCryptoPunk } from "./approve-crypto-punk"

const { provider, addresses, wallets } = createGanacheProvider(DEV_PK_5)
const { providers, web3v4 } = createEthereumProviders(provider, wallets[0])

/**
 * @group provider/ganache
 */
describe.each(providers)("approve crypto punks", (ethereum: Ethereum) => {
  const [sellerAddress] = addresses

  const it = awaitAll({
    punksMarket: deployCryptoPunks(web3v4),
  })

  const send = getSendWithInjects()
  const approve = approveCryptoPunk.bind(null, ethereum, send)

  beforeAll(async () => {
    await sentTx(it.punksMarket.methods.allInitialOwnersAssigned(), { from: sellerAddress })
    await sentTx(it.punksMarket.methods.getPunk(0), { from: sellerAddress })
  })

  test(`[${ethereum.constructor.name}] should approve`, async () => {
    const operator = randomEVMAddress()

    const tx = await approve(toEVMAddress(it.punksMarket.options.address!), sellerAddress, operator, 0)
    await tx?.wait()
    const offer = await it.punksMarket.methods.punksOfferedForSale(0).call()

    expect(offer.isForSale).toBe(true)
    expect(offer.punkIndex.toString()).toBe("0")
    expect(offer.seller.toLowerCase()).toBe(sellerAddress.toLowerCase())
    expect(offer.minValue.toString()).toBe("0")
    expect(offer.onlySellTo.toLowerCase()).toBe(operator.toLowerCase())
  })

  test(`[${ethereum.constructor.name}] should not approve if already approved`, async () => {
    const operator = randomEVMAddress()

    await sentTx(it.punksMarket.methods.offerPunkForSaleToAddress(0, 0, operator), { from: sellerAddress })

    await delay(2000)
    const approveResult = await approve(toEVMAddress(it.punksMarket.options.address!), sellerAddress, operator, 0)

    console.log("approve", approveResult)
    expect(approveResult === undefined).toBeTruthy()
  })
})
