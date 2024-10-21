import type { Asset, EVMAddress } from "@rarible/ethereum-api-client"
import { toBigNumber } from "@rarible/types/build/big-number"
import { toEVMAddress } from "@rarible/types"
import { awaitAll, createGanacheProvider, deployWethContract } from "@rarible/ethereum-sdk-test-common"
import { Web3v4Ethereum } from "@rarible/web3-v4-ethereum"
import { checkGreaterThanMinPaymentValue, checkMinPaymentValue } from "./check-min-payment-value"

/**
 * @group provider/ganache
 */
describe("check min payment value fn", function () {
  const { addresses, web3 } = createGanacheProvider()
  const [address] = addresses
  const ethereum = new Web3v4Ethereum({ web3, from: address, gas: 1000000 })

  const it = awaitAll({
    weth: deployWethContract(web3),
  })

  const enoughEthAsset: Asset = {
    assetType: {
      assetClass: "ETH",
    },
    value: toBigNumber("100000000000000"),
  }
  const notEnoughEthAsset: Asset = {
    assetType: {
      assetClass: "ETH",
    },
    value: toBigNumber("10000000000"),
  }
  const erc721Asset: Asset = {
    assetType: {
      assetClass: "ERC721",
      contract: toEVMAddress("0x0000000000000000000000000000000000000001"),
      tokenId: toBigNumber("1"),
    },
    value: toBigNumber("1"),
  }

  test("checkGreaterThanMinPaymentValue throws error with weth token", async () => {
    let err: any
    try {
      const wethAsset: Asset = {
        assetType: {
          assetClass: "ERC20",
          contract: it.weth.options.address as EVMAddress,
        },
        value: toBigNumber("10"),
      }
      await checkGreaterThanMinPaymentValue(ethereum, wethAsset)
    } catch (e) {
      err = e
    }
    expect(err?.message.startsWith("Asset value must be greater or equal to")).toBeTruthy()
  })

  test("checkGreaterThanMinPaymentValue throws error with ETH", async () => {
    let err: any
    try {
      await checkGreaterThanMinPaymentValue(ethereum, notEnoughEthAsset)
    } catch (e) {
      err = e
    }
    expect(err?.message.startsWith("Asset value must be greater or equal to")).toBeTruthy()
  })

  test("checkGreaterThanMinPaymentValue returns undefined with 0.0001 ETH", async () => {
    await checkGreaterThanMinPaymentValue(ethereum, enoughEthAsset)
  })

  test("checkMinPaymentValue returns undefined if sell order has been passed", async () => {
    await checkMinPaymentValue(ethereum, {
      make: erc721Asset,
      take: enoughEthAsset,
    } as any)
  })

  test("checkMinPaymentValue returns undefined if bid order has been passed", async () => {
    await checkMinPaymentValue(ethereum, {
      make: enoughEthAsset,
      take: erc721Asset,
    } as any)
  })

  test("checkMinPaymentValue throws error if sell order has been passed", async () => {
    let err: any
    try {
      await checkMinPaymentValue(ethereum, {
        make: erc721Asset,
        take: notEnoughEthAsset,
      } as any)
    } catch (e) {
      err = e
    }
    expect(err?.message.startsWith("Asset value must be greater or equal to")).toBeTruthy()
  })

  test("checkMinPaymentValue throws error if bid order has been passed", async () => {
    let err: any
    try {
      await checkMinPaymentValue(ethereum, {
        make: notEnoughEthAsset,
        take: erc721Asset,
      } as any)
    } catch (e) {
      err = e
    }
    expect(err?.message.startsWith("Asset value must be greater or equal to")).toBeTruthy()
  })

  test("checkMinPaymentValue should pass zero-price orders", async () => {
    await checkMinPaymentValue(ethereum, {
      make: {
        assetType: {
          assetClass: "ETH",
        },
        value: toBigNumber("0"),
      },
      take: erc721Asset,
    } as any)
  })
})
