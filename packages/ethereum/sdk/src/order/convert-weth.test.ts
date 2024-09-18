import Web3 from "web3"
import {
  awaitAll,
  createE2eProvider,
  createGanacheProvider,
  deployWethContract,
  DEV_PK_1,
} from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress } from "@rarible/types"
import { toBn } from "@rarible/utils"
import { getSimpleSendWithInjects } from "../common/send-transaction"
import { getEthereumConfig, getNetworkConfigByChainId } from "../config"
import { ConvertWeth } from "./convert-weth"
import { createWethContract } from "./contracts/weth"

/**
 * @group provider/ganache
 */
describe("convert weth test", () => {
  const { addresses, provider } = createGanacheProvider()
  const [sender1Address] = addresses
  const web3 = new Web3(provider as any)
  const ethereum = new Web3Ethereum({ web3, from: sender1Address, gas: 1000000 })
  const config = getEthereumConfig("dev-ethereum")
  const getConfig = async () => config

  const send = getSimpleSendWithInjects()
  const converter = new ConvertWeth(ethereum, send, getConfig)

  const it = awaitAll({
    deployWeth: deployWethContract(web3),
  })

  test("convert eth to weth test", async () => {
    config.weth = toAddress(it.deployWeth.options.address)

    const contract = createWethContract(ethereum, toAddress(it.deployWeth.options.address))

    const startEthBalance = await web3.eth.getBalance(sender1Address)
    const startBalance = await contract.functionCall("balanceOf", sender1Address).call()

    const tx = await converter.convert(
      { assetClass: "ETH" },
      { assetClass: "ERC20", contract: await converter.getWethContractAddress() },
      toBn("0.1"),
    )
    await tx.wait()

    const finishBalance = await contract.functionCall("balanceOf", sender1Address).call()
    const finishEthBalance = await web3.eth.getBalance(sender1Address)

    const diff = toBn(finishBalance).minus(startBalance)
    const diffInEth = toBn(startEthBalance).minus(finishEthBalance)

    expect(diff.toString()).toBe("100000000000000000")
    expect(diffInEth.gte("100000000000000000")).toBeTruthy()
  })

  test("convert weth to eth test", async () => {
    config.weth = toAddress(it.deployWeth.options.address)
    const contract = createWethContract(ethereum, toAddress(it.deployWeth.options.address))
    const tx = await converter.convert(
      { assetClass: "ETH" },
      { assetClass: "ERC20", contract: await converter.getWethContractAddress() },
      toBn("0.2"),
    )
    await tx.wait()

    const initWethBalance = await contract.functionCall("balanceOf", sender1Address).call()
    const tx1 = await converter.convert(
      { assetClass: "ERC20", contract: await converter.getWethContractAddress() },
      { assetClass: "ETH" },
      toBn("0.1"),
    )
    await tx1.wait()

    const finishWethBalance = await contract.functionCall("balanceOf", sender1Address).call()
    const diff = toBn(initWethBalance).minus(finishWethBalance)
    expect(diff.toString()).toBe("100000000000000000")
  })

  test("should throw error in case of unsupported contract", async () => {
    const fakeAddress = toAddress("0x0000000000000000000000000000000000000000")
    expect(() =>
      converter.convert({ assetClass: "ETH" }, { assetClass: "ERC20", contract: fakeAddress }, toBn("0.1")),
    ).rejects.toThrowError(`Contract is not supported - ${fakeAddress}`)
  })
})

describe.skip("convert weth estimate gas test", () => {
  const providerSettings = {
    rpcUrl: "https://rpc.matchain.io",
    networkId: 698,
  }
  const { provider, wallet } = createE2eProvider(DEV_PK_1, providerSettings)
  const web3 = new Web3(provider as any)
  const ethereum = new Web3Ethereum({
    web3,
    from: wallet.getAddressString(),
    gas: 1000000,
  })
  const convertClass = new ConvertWeth(ethereum, null as any, async () =>
    getNetworkConfigByChainId(providerSettings.networkId),
  )

  test("estimateGas for deposit method", async () => {
    const fn = await convertClass.depositWeiFunctionCall()
    await fn.estimateGas({ from: wallet.getAddressString(), value: 0 })
  })
})
