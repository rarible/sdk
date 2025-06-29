import { deployTestErc20, DEV_PK_1 } from "@rarible/ethereum-sdk-test-common"
import type { Web3v4Ethereum } from "@rarible/web3-v4-ethereum"
import { randomEVMAddress, toEVMAddress, toBigNumber } from "@rarible/types"
import { toBn } from "@rarible/utils"
import type { Erc20AssetType, EVMAddress } from "@rarible/ethereum-api-client"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import type { EthAssetType } from "@rarible/ethereum-api-client/build/models/AssetType"
import { createRaribleSdk } from "../index"
import type { EthereumNetwork } from "../types"
import { ethereumNetworks } from "../config"
import { createErc20Contract } from "../order/contracts/erc20"
import type { BalanceRequestAssetType } from "./balances"
import { Balances } from "./balances"
import { createEthereumApis } from "./apis"
import { createE2eTestProvider } from "./test/create-test-providers"
import { getTestAPIKey } from "./test/test-credentials"
import { getSendWithInjects } from "./send-transaction"
import { retry } from "./retry"
import { getErc20AssetType } from "./asset-types"
import { sentTx } from "./test"
import { getNetworkFromChainId } from "./index"

/**
 * GetBalance tests
 * @group provider/dev
 */
describe("getBalance test", () => {
  const { web3v4Ethereum: ethereum } = createE2eTestProvider(DEV_PK_1)

  const getApis = async () => {
    const chainId = await ethereum.getChainId()
    const env = getNetworkFromChainId(chainId)
    return createEthereumApis(env)
  }

  const send = getSendWithInjects()
  const balances = new Balances(ethereum, send, getApis)

  async function awaitBalance(address: EVMAddress, assetType: BalanceRequestAssetType, value: BigNumberValue) {
    await retry(10, 3000, async () => {
      const balance = await balances.getBalance(address, assetType)
      expect(balance.toString()).toBe(value.toString())
    })
  }

  test.concurrent("get eth balance", async () => {
    const senderAddress = toEVMAddress("0xC072c9889dE7206c1C18B9d9973B06B8646FC6bd")
    const balance = await balances.getBalance(senderAddress, { assetClass: "ETH" })
    expect(balance.toString()).toBe("0")
  })

  test.concurrent("get non-zero eth balance", async () => {
    const senderAddress = toEVMAddress("0xa14FC5C72222FAce8A1BcFb416aE2571fA1a7a91")
    const balance = await balances.getBalance(senderAddress, { assetClass: "ETH" })
    expect(balance.toString()).toBe("0.00019355")
  })

  test("get erc20 balance", async () => {
    const generatedAddress = randomEVMAddress()
    const { erc20ContractAddress } = await deployAndMintErc20(ethereum, generatedAddress, "1000000000000000")
    const erc20AssetType = getErc20AssetType(erc20ContractAddress)
    await awaitBalance(generatedAddress, erc20AssetType, "0.001")
  })

  test("transfer eth", async () => {
    const generatedAddress = randomEVMAddress()
    const ethAssetType: EthAssetType = {
      assetClass: "ETH",
    }
    const tx = await balances.transfer(generatedAddress, {
      assetType: ethAssetType,
      value: "1" as any,
    })
    await tx.wait()
    await awaitBalance(generatedAddress, ethAssetType, "0.000000000000000001")
  })

  test("transfer erc20 with value", async () => {
    const generatedAddress = randomEVMAddress()
    const sender = toEVMAddress(await ethereum.getFrom())
    const { erc20ContractAddress } = await deployAndMintErc20(ethereum, sender, "1000000000000000")
    const erc20AssetType: Erc20AssetType = getErc20AssetType(erc20ContractAddress)
    await awaitBalance(sender, erc20AssetType, "0.001")

    const tx = await balances.transfer(generatedAddress, {
      assetType: erc20AssetType,
      value: toBigNumber("1000000000000000"),
    })
    await tx.wait()
    await awaitBalance(generatedAddress, erc20AssetType, "0.001")
  })

  test("transfer erc20 with valueDecimal", async () => {
    const generatedAddress = randomEVMAddress()
    const sender = toEVMAddress(await ethereum.getFrom())
    const { erc20ContractAddress } = await deployAndMintErc20(ethereum, sender, "1000000000000000")
    const erc20AssetType: Erc20AssetType = getErc20AssetType(erc20ContractAddress)
    await awaitBalance(sender, erc20AssetType, "0.001")

    const tx = await balances.transfer(generatedAddress, {
      assetType: erc20AssetType,
      valueDecimal: toBigNumber("0.001"),
    })
    await tx.wait()
    await awaitBalance(generatedAddress, erc20AssetType, "0.001")
  })

  test("erc-20 balance should be equal from contract", async () => {
    const generatedAddress = randomEVMAddress()
    const { erc20ContractAddress } = await deployAndMintErc20(ethereum, generatedAddress, "1000000000000000")
    const contract = createErc20Contract(ethereum, erc20ContractAddress)
    const erc20AssetType = getErc20AssetType(erc20ContractAddress)
    const expectedBalance = "0.001"
    await awaitBalance(generatedAddress, erc20AssetType, expectedBalance)

    const contractDecimals = await contract.functionCall("decimals").call()
    const rawContractBalance = await contract.functionCall("balanceOf", generatedAddress).call()
    const decimalBalance = toBn(rawContractBalance).div(toBn(10).pow(contractDecimals))
    expect(decimalBalance.toString()).toBe(expectedBalance.toString())
  })

  test("get erc-20 balance big value", async () => {
    const generatedAddress = randomEVMAddress()
    const { erc20ContractAddress } = await deployAndMintErc20(
      ethereum,
      generatedAddress,
      "10000000000000000000000000000",
    )
    const erc20AssetType = getErc20AssetType(erc20ContractAddress)
    await awaitBalance(generatedAddress, erc20AssetType, "10000000000")
  })

  test("get erc-20 balance tiny value", async () => {
    const generatedAddress = randomEVMAddress()
    const { erc20ContractAddress } = await deployAndMintErc20(ethereum, generatedAddress, "1")
    const erc20AssetType = getErc20AssetType(erc20ContractAddress)
    await awaitBalance(generatedAddress, erc20AssetType, "0.000000000000000001")
  })
})

const randomEvmAddress = toEVMAddress("0xE0c03F1a1a930331D88DaBEd59dc4Ae6d63DDEAD")

const filteredProductionNetworks = ethereumNetworks.filter(network => !/testnet|dev|sepolia|sei-arctic-1/.test(network))
describe.each(filteredProductionNetworks)("get balances each of environments", (env: EthereumNetwork) => {
  const sdk = createRaribleSdk(undefined, env, {
    apiKey: getTestAPIKey(env),
  })

  test(`get balance on ${env}`, async () => {
    const value = await sdk.balances.getBalance(randomEvmAddress, { assetClass: "ETH" })
    expect(value.toNumber()).toEqual(0)
  })
})

async function deployAndMintErc20(ethereum: Web3v4Ethereum, to: EVMAddress, value: BigNumberValue) {
  const erc20Contract = await deployTestErc20(ethereum.getWeb3Instance(), "TST", "TST")
  await sentTx(erc20Contract.methods.mint(to, value), { from: await ethereum.getFrom() })
  return {
    erc20Contract,
    erc20ContractAddress: toEVMAddress(erc20Contract.options.address),
  }
}
