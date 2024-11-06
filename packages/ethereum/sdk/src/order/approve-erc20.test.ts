import { awaitAll, deployTestErc20, createGanacheProvider, DEV_PK_5 } from "@rarible/ethereum-sdk-test-common"
import { toBn } from "@rarible/utils/build/bn"
import type { Ethereum } from "@rarible/ethereum-provider"
import { randomEVMAddress, toEVMAddress } from "@rarible/types"
import { getSendWithInjects } from "../common/send-transaction"
import { sentTx } from "../common/test"
import { createEthereumProviders } from "../common/test/create-test-providers"
import { approveErc20 as approveErc20Template } from "./approve-erc20"
import { prependProviderName } from "./test/prepend-provider-name"

const { provider, addresses, wallets } = createGanacheProvider(DEV_PK_5)
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
    const operator = randomEVMAddress()
    const tx = await approveErc20(toEVMAddress(it.testErc20.options.address!), testAddress, operator, toBn(100), false)
    await tx?.wait()
    const result = toBn(await it.testErc20.methods.allowance(testAddress, operator).call())
    expect(result.eq(100)).toBeTruthy()
  })

  test(prependProviderName(ethereum, "should approve if value infinite"), async () => {
    const infiniteBn = toBn(2).pow(256).minus(1)

    const operator = randomEVMAddress()
    const addressErc20 = toEVMAddress(it.testErc20.options.address!)
    const tx = await approveErc20(addressErc20, testAddress, operator, toBn(infiniteBn), true)
    await tx?.wait()
    const result = toBn(await it.testErc20.methods.allowance(testAddress, operator).call())
    expect(result.toString()).toBe(infiniteBn.toString())
  })

  test(prependProviderName(ethereum, "should not approve if already approved"), async () => {
    const operator = randomEVMAddress()
    const testBnValue = 200

    await sentTx(it.testErc20.methods.approve(operator, testBnValue), { from: testAddress })

    const result = await approveErc20(
      toEVMAddress(it.testErc20.options.address!),
      testAddress,
      operator,
      toBn(testBnValue),
      false,
    )

    expect(result === undefined).toBeTruthy()
  })
})
