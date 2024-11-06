import { randomAddress, toCurrencyId, toUnionAddress, ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import BigNumber from "bignumber.js"
import type { EthEthereumAssetType } from "@rarible/api-client/build/models/AssetType"
import { createSdk } from "../../common/test/create-sdk"
import { createE2eTestProvider } from "./test/init-providers"
import { convertEthereumToUnionAddress } from "./common"
import { DEV_PK_1, POLYGON_TESTNET_SETTINGS } from "./test/common"
import { EVMContractsTestSuite } from "./test/suite/contracts"
import { ERC20Mintable } from "./test/suite/contracts/variants/erc20-mintable"
import { ERC20 } from "./test/suite/contracts/variants/erc20"
import type { EVMTestSuite } from "./test/suite"
import { EVMTestSuiteFactory } from "./test/suite"
import { EVMNativeToken } from "./test/suite/contracts/variants/native"

describe("get balance", () => {
  const suiteFactoryETH = new EVMTestSuiteFactory(Blockchain.ETHEREUM)
  let suiteDevETH: EVMTestSuite<Blockchain.ETHEREUM>

  beforeAll(async () => {
    suiteDevETH = await suiteFactoryETH.create(DEV_PK_1)
  })

  afterAll(() => {
    suiteDevETH.destroy()
  })

  const { web3v4Ethereum: ethereum } = createE2eTestProvider(DEV_PK_1)

  const testSuite = new EVMContractsTestSuite(Blockchain.ETHEREUM, ethereum)

  test("should be the same ERC-20 balance from contract/api", async () => {
    const erc20Contract = await ERC20Mintable.deploy(Blockchain.ETHEREUM, ethereum)
    const generatedAddress = randomAddress()
    await erc20Contract.mint(1, generatedAddress)
    const erc20ContractBalance = await erc20Contract.fromWei(await erc20Contract.balanceOf(generatedAddress))
    //With AssetType
    await suiteDevETH.balances.waitBalance(
      ERC20.getAssetType(erc20Contract.contractAddress),
      erc20ContractBalance,
      convertEthereumToUnionAddress(generatedAddress),
    )
    //With CurrencyId
    await suiteDevETH.balances.waitBalance(
      toCurrencyId(erc20Contract.contractAddress),
      erc20ContractBalance,
      convertEthereumToUnionAddress(generatedAddress),
    )
  })

  test("transfer ETH", async () => {
    const generatedAddress = randomAddress()
    const generatedUnionAddress = convertEthereumToUnionAddress(generatedAddress)
    const ethAssetType = {
      "@type": "ETH",
      blockchain: Blockchain.ETHEREUM,
    } as EthEthereumAssetType

    const tx = await suiteDevETH.sdk.balances.transfer({
      recipient: generatedUnionAddress,
      currency: ethAssetType,
      amount: "0.0001",
    })
    await tx.wait()
    await suiteDevETH.balances.waitBalance(ethAssetType, "0.0001", generatedUnionAddress)
  })

  test("transfer ETH with currencyId", async () => {
    const generatedAddress = randomAddress()
    const generatedUnionAddress = convertEthereumToUnionAddress(generatedAddress)
    const ethCurrencyId = toCurrencyId(`${Blockchain.ETHEREUM}:${ZERO_ADDRESS}`)

    const tx = await suiteDevETH.sdk.balances.transfer({
      recipient: generatedUnionAddress,
      currency: ethCurrencyId,
      amount: "0.00001",
    })
    await tx.wait()
    await suiteDevETH.balances.waitBalance(ethCurrencyId, "0.00001", generatedUnionAddress)
  })

  test("transfer ERC-20", async () => {
    const erc20Contract = await ERC20Mintable.deploy(Blockchain.ETHEREUM, ethereum)
    const generatedAddress = randomAddress()
    const generatedUnionAddress = convertEthereumToUnionAddress(generatedAddress)
    await erc20Contract.mint(1, generatedAddress)
    const erc20ContractBalance = await erc20Contract.fromWei(await erc20Contract.balanceOf(generatedAddress))

    const tx = await suiteDevETH.sdk.balances.transfer({
      recipient: generatedUnionAddress,
      currency: {
        "@type": "ETH",
        blockchain: Blockchain.ETHEREUM,
      },
      amount: 1,
    })
    await tx.wait()
    await suiteDevETH.balances.waitBalance(
      ERC20.getAssetType(erc20Contract.contractAddress),
      erc20ContractBalance,
      generatedUnionAddress,
    )
  })

  describe("get ETH balance with different request currencies", () => {
    const generatedAddress = randomAddress()
    const sponsorAmount = "0.00019355"

    beforeAll(async () => await suiteDevETH.sponsor(generatedAddress, sponsorAmount))

    test.each([
      { currency: EVMNativeToken.assetType, label: "Asset type" },
      { currency: EVMNativeToken.getCurrency(), label: "CurrencyID" },
    ])("$label", async ({ currency }) => {
      await suiteDevETH.balances.waitBalance(currency, sponsorAmount, convertEthereumToUnionAddress(generatedAddress))
    })
  })

  describe("ETH <-> wETH convertation", () => {
    const wethContract = testSuite.getContract("wrapped_eth")

    test("ETH -> wETH", async () => {
      const startBalance = await suiteDevETH.sdk.balances.getBalance(suiteDevETH.addressUnion, wethContract.assetType)
      await suiteDevETH.balances.convertToWeth("0.00035")

      await suiteDevETH.balances.waitBalance(wethContract.assetType, toBn(startBalance).plus("0.00035"))
    })

    test("wETH -> ETH", async () => {
      const wethContract = testSuite.getContract("wrapped_eth")
      const startBalance = await suiteDevETH.sdk.balances.getBalance(suiteDevETH.addressUnion, wethContract.assetType)
      await suiteDevETH.balances.convertFromWeth("0.00035")

      await suiteDevETH.balances.waitBalance(wethContract.assetType, toBn(startBalance).minus("0.00035"))
    })
  })
})

//@todo update polygon testnet balances
describe.skip("get polygon balance", () => {
  const { ethereumWallet } = createE2eTestProvider(
    "ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9",
    POLYGON_TESTNET_SETTINGS,
  )

  const sdk = createSdk(ethereumWallet, "testnet")

  test.concurrent("get Polygon balance", async () => {
    const walletAddress = toUnionAddress("ETHEREUM:0xc8f35463Ea36aEE234fe7EFB86373A78BF37e2A1")
    const balance = await sdk.balances.getBalance(walletAddress, {
      "@type": "ETH",
      blockchain: Blockchain.POLYGON,
    })
    expect(balance.toString()).toEqual("0.009145")
  })

  test.concurrent("get Polygon balance with CurrencyId", async () => {
    const walletAddress = toUnionAddress("ETHEREUM:0xc8f35463Ea36aEE234fe7EFB86373A78BF37e2A1")
    const currency = toCurrencyId(`POLYGON:${ZERO_ADDRESS}`)
    const balance = await sdk.balances.getBalance(walletAddress, currency)
    expect(balance.toString()).toEqual("0.009145")
  })
})

describe.skip("Bidding balance", () => {
  const { ethereumWallet } = createE2eTestProvider("ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9")

  const sdk = createSdk(ethereumWallet, "development")

  test("Should check bidding balance & deposit & withdraw", async () => {
    const checkBalance = async (expecting: BigNumberValue | null) => {
      const balance = await sdk.balances.getBiddingBalance({
        blockchain: Blockchain.ETHEREUM,
        walletAddress: toUnionAddress(`ETHEREUM:${await ethereumWallet.ethereum.getFrom()}`),
      })
      if (expecting !== null) {
        expect(parseFloat(balance.toString())).toBeCloseTo(parseFloat(expecting.toString()), 5)
      }
      return balance
    }

    const initBalance = new BigNumber(await checkBalance(null))

    await checkBalance(initBalance)

    let tx = await sdk.balances.depositBiddingBalance({ amount: 0.005, blockchain: Blockchain.ETHEREUM })
    await tx.wait()

    const remainBalance = await checkBalance(new BigNumber(initBalance).plus(0.005))

    tx = await sdk.balances.withdrawBiddingBalance({ amount: remainBalance, blockchain: Blockchain.ETHEREUM })
    await tx.wait()

    await checkBalance(0)
  })
})
