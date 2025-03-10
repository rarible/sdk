import { randomEVMAddress, randomWord, toEVMAddress, toBigNumber, toBinary, ZERO_ADDRESS } from "@rarible/types"
import { toBn } from "@rarible/utils/build/bn"
import {
  awaitAll,
  createGanacheProvider,
  deployCryptoPunkAssetMatcher,
  deployCryptoPunks,
  deployCryptoPunkTransferProxy,
  deployErc20TransferProxy,
  deployTestErc1155,
  deployTestErc20,
  deployTestErc721,
  deployTestExchangeV2,
  deployTestRoyaltiesProvider,
  deployTransferProxy,
} from "@rarible/ethereum-sdk-test-common"
import { getSimpleSendWithInjects } from "../../common/send-transaction"
import { getEthereumConfig } from "../../config"
import { signOrder } from "../sign-order"
import type { SimpleOrder } from "../types"
import { id } from "../../common/id"
import { approveErc20 } from "../approve-erc20"
import { getApis as getApisTemplate } from "../../common/apis"
import { createRaribleSdk } from "../../index"
import { FILL_CALLDATA_TAG } from "../../config/common"
import type { EthereumNetwork } from "../../types"
import { getEndDateAfterMonth } from "../test/utils"
import { createBuyerSellerProviders } from "../../common/test/create-test-providers"
import { sentTx, sentTxConfirm } from "../../common/test"
import type { BuyOrderRequest } from "./types"
import { OrderFiller } from "./index"

const { addresses, provider, wallets } = createGanacheProvider()
const { providers, web3v4Buyer } = createBuyerSellerProviders(provider, wallets, {
  excludeProviders: [
    // "EthersEthereum",
    //@todo some tests don't work with ethers providers, need to fix
    "EthersWeb3ProviderEthereum",
    // "Web3v4Ethereum",
    // "Web3Ethereum",
  ],
  // excludeProviders: [],
})

/**
 * @group provider/ganache
 */
describe.each(providers)("buy & acceptBid orders", (buyerEthereum, sellerEthereum) => {
  const [buyerAddress, sellerAddress] = addresses
  const web3 = web3v4Buyer
  const env: EthereumNetwork = "dev-ethereum"
  const config = getEthereumConfig(env)
  const getConfig = async () => config
  const getApisBuyer = getApisTemplate.bind(null, buyerEthereum, env)
  const getApisSeller = getApisTemplate.bind(null, sellerEthereum, env)

  const send = getSimpleSendWithInjects()
  const getBaseOrderFee = async () => 100
  const filler = new OrderFiller(buyerEthereum, send, getConfig, getApisBuyer, getBaseOrderFee, env)

  const it = awaitAll({
    testErc20: deployTestErc20(web3, "Test1", "TST1"),
    testErc721: deployTestErc721(web3, "Test", "TST"),
    testErc1155: deployTestErc1155(web3, "Test"),
    transferProxy: deployTransferProxy(web3),
    erc20TransferProxy: deployErc20TransferProxy(web3),
    royaltiesProvider: deployTestRoyaltiesProvider(web3),
    exchangeV2: deployTestExchangeV2(web3),
    punksMarket: deployCryptoPunks(web3),
    punksTransferProxy: deployCryptoPunkTransferProxy(web3),
    punkAssetMatcher: deployCryptoPunkAssetMatcher(web3),
  })

  beforeAll(async () => {
    /**
     * Configuring
     */
    await sentTx(
      it.exchangeV2.methods.__ExchangeV2_init(
        toEVMAddress(it.transferProxy.options.address!),
        toEVMAddress(it.erc20TransferProxy.options.address!),
        toBigNumber("0"),
        buyerAddress,
        toEVMAddress(it.royaltiesProvider.options.address!),
      ),
      { from: buyerAddress },
    )
    config.exchange.v1 = toEVMAddress(it.exchangeV2.options.address!)
    config.exchange.v2 = toEVMAddress(it.exchangeV2.options.address!)
    config.transferProxies.cryptoPunks = toEVMAddress(it.punksTransferProxy.options.address!)
    config.transferProxies.erc20 = toEVMAddress(it.erc20TransferProxy.options.address!)
    // config.chainId = 200500

    await sentTx(it.transferProxy.methods.addOperator(toEVMAddress(it.exchangeV2.options.address!)), {
      from: buyerAddress,
    })
    await sentTx(it.erc20TransferProxy.methods.addOperator(toEVMAddress(it.exchangeV2.options.address!)), {
      from: buyerAddress,
    })

    //Set transfer proxy for crypto punks
    await sentTx(it.exchangeV2.methods.setTransferProxy(id("CRYPTO_PUNKS"), it.punksTransferProxy.options.address!), {
      from: buyerAddress,
    })

    //Set asset matcher for crypto punks
    await sentTx(it.exchangeV2.methods.setAssetMatcher(id("CRYPTO_PUNKS"), it.punkAssetMatcher.options.address!), {
      from: buyerAddress,
    })

    await sentTx(it.punksMarket.methods.allInitialOwnersAssigned(), { from: buyerAddress })

    await sentTx(it.testErc20.methods.mint(buyerAddress, 10000), { from: buyerAddress })
    await sentTx(it.testErc1155.methods.mint(sellerAddress, 999, 100, "0x"), { from: buyerAddress })
  })

  test(`[${buyerEthereum.constructor.name}] should match order(buy erc1155 for erc20)`, async () => {
    //sender1 has ERC20, sender2 has ERC1155

    await sentTxConfirm(it.testErc20.methods.mint(buyerAddress, 100), { from: buyerAddress })
    await sentTxConfirm(it.testErc1155.methods.mint(sellerAddress, 1, 10, "0x"), { from: buyerAddress })

    const left: SimpleOrder = {
      make: {
        assetType: {
          assetClass: "ERC1155",
          contract: toEVMAddress(it.testErc1155.options.address!),
          tokenId: toBigNumber("1"),
        },
        value: toBigNumber("5"),
      },
      maker: sellerAddress,
      take: {
        assetType: {
          assetClass: "ERC20",
          contract: toEVMAddress(it.testErc20.options.address!),
        },
        value: toBigNumber("10"),
      },
      salt: randomWord(),
      type: "RARIBLE_V2",
      data: {
        dataType: "RARIBLE_V2_DATA_V1",
        payouts: [],
        originFees: [],
      },
    }

    await sentTx(it.testErc20.methods.approve(it.erc20TransferProxy.options.address!, 10), {
      from: buyerAddress,
    })

    await sentTx(it.testErc1155.methods.setApprovalForAll(it.transferProxy.options.address!, true), {
      from: sellerAddress,
    })

    const signature = await signOrder(sellerEthereum, getConfig, left)

    const finalOrder = { ...left, signature }

    const startErc20Balance = toBn(await it.testErc20.methods.balanceOf(sellerAddress).call())
    const startErc1155Balance = toBn(await it.testErc1155.methods.balanceOf(buyerAddress, 1).call())

    const filler = new OrderFiller(buyerEthereum, send, getConfig, getApisBuyer, getBaseOrderFee, env)
    const buyRequest = { order: finalOrder, amount: 1, payouts: [], originFees: [] } as BuyOrderRequest
    await filler.getTransactionData(buyRequest)
    const tx = await filler.buy(buyRequest)
    await tx.wait()

    const finishErc20Balance = toBn(await it.testErc20.methods.balanceOf(sellerAddress).call())
    const finishErc1155Balance = toBn(await it.testErc1155.methods.balanceOf(buyerAddress, 1).call())

    expect(finishErc20Balance.minus(startErc20Balance).toString()).toBe("2")
    expect(finishErc1155Balance.minus(startErc1155Balance).toString()).toBe("1")
  })

  test(`should match order(buy erc1155 for erc20) with [${buyerEthereum.constructor.name}] provider`, async () => {
    //sender1 has ERC20, sender2 has ERC1155

    const tokenId = "999"
    const left: SimpleOrder = {
      make: {
        assetType: {
          assetClass: "ERC1155",
          contract: toEVMAddress(it.testErc1155.options.address!),
          tokenId: toBigNumber(tokenId),
        },
        value: toBigNumber("5"),
      },
      maker: sellerAddress,
      take: {
        assetType: {
          assetClass: "ERC20",
          contract: toEVMAddress(it.testErc20.options.address!),
        },
        value: toBigNumber("10"),
      },
      salt: randomWord(),
      type: "RARIBLE_V2",
      data: {
        dataType: "RARIBLE_V2_DATA_V1",
        payouts: [],
        originFees: [],
      },
    }

    await sentTx(it.testErc20.methods.approve(it.erc20TransferProxy.options.address!, 10), {
      from: buyerAddress,
    })

    await sentTx(it.testErc1155.methods.setApprovalForAll(it.transferProxy.options.address!, true), {
      from: sellerAddress,
    })

    const signature = await signOrder(sellerEthereum, getConfig, left)

    const finalOrder = { ...left, signature }

    const startErc20Balance = toBn(await it.testErc20.methods.balanceOf(buyerAddress).call())
    const startErc1155Balance = toBn(await it.testErc1155.methods.balanceOf(buyerAddress, tokenId).call())

    const marketplaceMarker = toBinary(`${ZERO_ADDRESS}00000001`)
    const getApis = getApisTemplate.bind(null, buyerEthereum, env)

    const filler = new OrderFiller(buyerEthereum, send, getConfig, getApis, getBaseOrderFee, env, {
      marketplaceMarker,
    })
    const tx = await filler.buy({ order: finalOrder, amount: 1, payouts: [], originFees: [] })
    await tx.wait()
    const matchEvent = (await tx.getEvents()).find(e => e.event === "Match")
    expect(matchEvent).toBeTruthy()
    expect(matchEvent?.returnValues).toBeTruthy()

    const finishErc20Balance = toBn(await it.testErc20.methods.balanceOf(buyerAddress).call())
    const finishErc1155Balance = toBn(await it.testErc1155.methods.balanceOf(buyerAddress, tokenId).call())

    expect(startErc20Balance.minus(finishErc20Balance).toString()).toBe("2")
    expect(finishErc1155Balance.minus(startErc1155Balance).toString()).toBe("1")
  })

  test(`[${buyerEthereum.constructor.name}] get transaction data`, async () => {
    const left: SimpleOrder = {
      make: {
        assetType: {
          assetClass: "ERC1155",
          contract: toEVMAddress(it.testErc1155.options.address!),
          tokenId: toBigNumber("1"),
        },
        value: toBigNumber("5"),
      },
      maker: sellerAddress,
      take: {
        assetType: {
          assetClass: "ETH",
        },
        value: toBigNumber("1000000"),
      },
      salt: randomWord(),
      type: "RARIBLE_V2",
      data: {
        dataType: "RARIBLE_V2_DATA_V1",
        payouts: [],
        originFees: [],
      },
    }

    const signature = await signOrder(sellerEthereum, getConfig, left)

    const finalOrder = { ...left, signature }
    const originFees = [
      {
        account: randomEVMAddress(),
        value: 100,
      },
    ]
    await filler.getTransactionData({ order: finalOrder, amount: 2, originFees })
    await filler.getBuyTx({
      request: { order: finalOrder, amount: 2, originFees },
      from: toEVMAddress("0xf4314839F9Fc945D3B7693E3F6c121cb1d2de066"),
    })
  })

  test(`[${buyerEthereum.constructor.name}] should match order(buy erc1155 for eth)`, async () => {
    //sender1 has ETH, sender2 has ERC1155

    const tokenId = "3"
    await sentTx(it.testErc1155.methods.mint(sellerAddress, tokenId, 10, "0x"), { from: buyerAddress })

    const left: SimpleOrder = {
      make: {
        assetType: {
          assetClass: "ERC1155",
          contract: toEVMAddress(it.testErc1155.options.address!),
          tokenId: toBigNumber(tokenId),
        },
        value: toBigNumber("5"),
      },
      maker: sellerAddress,
      take: {
        assetType: {
          assetClass: "ETH",
        },
        value: toBigNumber("1000000"),
      },
      salt: randomWord(),
      type: "RARIBLE_V2",
      data: {
        dataType: "RARIBLE_V2_DATA_V1",
        payouts: [],
        originFees: [],
      },
    }

    await sentTx(it.testErc1155.methods.setApprovalForAll(it.transferProxy.options.address!, true), {
      from: sellerAddress,
    })

    const signature = await signOrder(sellerEthereum, getConfig, left)

    const before1 = toBn(await it.testErc1155.methods.balanceOf(buyerAddress, tokenId).call())
    const before2 = toBn(await it.testErc1155.methods.balanceOf(sellerAddress, tokenId).call())

    const finalOrder = { ...left, signature }
    const originFees = [
      {
        account: randomEVMAddress(),
        value: 100,
      },
    ]
    const tx = await filler.buy({ order: finalOrder, amount: 2, originFees })
    await tx.wait()

    expect(toBn(await it.testErc1155.methods.balanceOf(sellerAddress, tokenId).call()).toString()).toBe(
      before2.minus(2).toFixed(),
    )
    expect(toBn(await it.testErc1155.methods.balanceOf(buyerAddress, tokenId).call()).toString()).toBe(
      before1.plus(2).toFixed(),
    )
  })

  test("should match order(buy erc1155 for eth) with dataType=V3", async () => {
    await testMatchV2OrHigher("RARIBLE_V2_DATA_V3", true)
  })

  test("should match order(buy erc1155 for eth) with dataType=V2", async () => {
    await testMatchV2OrHigher("RARIBLE_V2_DATA_V2", true)
  })

  test("should match order(buy erc1155 for eth) with dataType=V3 and no origin fees", async () => {
    await testMatchV2OrHigher("RARIBLE_V2_DATA_V3", false)
  })

  test("should match order(buy erc1155 for eth) with dataType=V2 and no origin fees", async () => {
    await testMatchV2OrHigher("RARIBLE_V2_DATA_V2", false)
  })

  async function testMatchV2OrHigher(dataType: "RARIBLE_V2_DATA_V2" | "RARIBLE_V2_DATA_V3", includeFees: boolean) {
    await sentTx(it.testErc1155.methods.mint(sellerAddress, 4, 10, "0x"), { from: buyerAddress })

    const left: SimpleOrder = {
      make: {
        assetType: {
          assetClass: "ERC1155",
          contract: toEVMAddress(it.testErc1155.options.address),
          tokenId: toBigNumber("1"),
        },
        value: toBigNumber("5"),
      },
      maker: sellerAddress,
      take: {
        assetType: {
          assetClass: "ETH",
        },
        value: toBigNumber("1000000"),
      },
      salt: randomWord(),
      type: "RARIBLE_V2",
      data: {
        dataType,
        payouts: [],
        originFees: [],
        isMakeFill: true,
      },
    }

    await sentTx(it.testErc1155.methods.setApprovalForAll(it.transferProxy.options.address, true), {
      from: sellerAddress,
    })

    const signature = await signOrder(sellerEthereum, getConfig, left)

    const before1 = toBn(await it.testErc1155.methods.balanceOf(buyerAddress, 1).call())
    const before2 = toBn(await it.testErc1155.methods.balanceOf(sellerAddress, 1).call())

    const finalOrder = { ...left, signature }
    const originFees = [
      {
        account: randomEVMAddress(),
        value: 100,
      },
    ]
    const tx = await filler.buy({ order: finalOrder, amount: 2, originFees: includeFees ? originFees : [] })
    await tx.wait()

    expect(toBn(await it.testErc1155.methods.balanceOf(sellerAddress, 1).call()).toString()).toBe(
      before2.minus(2).toFixed(),
    )
    expect(toBn(await it.testErc1155.methods.balanceOf(buyerAddress, 1).call()).toString()).toBe(
      before1.plus(2).toFixed(),
    )
  }

  test(`[${buyerEthereum.constructor.name}] should fill order (buy) with crypto punks asset`, async () => {
    const punkId = 43
    //Mint punks
    await sentTx(it.punksMarket.methods.getPunk(punkId), { from: sellerAddress })
    await it.testErc20.methods.mint(buyerAddress, 100).send({ from: buyerAddress, gas: "200000" })

    const left: SimpleOrder = {
      make: {
        assetType: {
          assetClass: "CRYPTO_PUNKS",
          contract: toEVMAddress(it.punksMarket.options.address!),
          tokenId: punkId,
        },
        value: toBigNumber("1"),
      },
      maker: sellerAddress,
      take: {
        assetType: {
          assetClass: "ETH",
        },
        value: toBigNumber("1"),
      },
      salt: randomWord(),
      type: "RARIBLE_V2",
      data: {
        dataType: "RARIBLE_V2_DATA_V1",
        payouts: [],
        originFees: [],
      },
    }

    await sentTx(
      it.punksMarket.methods.offerPunkForSaleToAddress(punkId, 0, toEVMAddress(it.punksTransferProxy.options.address!)),
      { from: sellerAddress },
    )
    const signature = await signOrder(sellerEthereum, getConfig, left)

    const finalOrder = { ...left, signature }
    const tx = await filler.buy({ order: finalOrder, amount: 1, originFees: [] })
    await tx.wait()

    const ownerAddress = await it.punksMarket.methods.punkIndexToAddress(punkId).call()

    expect(ownerAddress.toLowerCase()).toBe(buyerAddress.toLowerCase())
  })

  test(`[${buyerEthereum.constructor.name}] should accept bid with crypto punks asset`, async () => {
    const punkId = 50
    //Mint crypto punks
    await sentTxConfirm(it.punksMarket.methods.getPunk(punkId), { from: sellerAddress })
    await it.testErc20.methods.mint(buyerAddress, 100).send({ from: buyerAddress, gas: "200000" })

    const tx = await approveErc20(
      buyerEthereum,
      send,
      toEVMAddress(it.testErc20.options.address!),
      toEVMAddress(buyerAddress),
      toEVMAddress(it.erc20TransferProxy.options.address!),
      toBigNumber("100"),
    )
    await tx?.wait()

    const left: SimpleOrder = {
      maker: buyerAddress,
      make: {
        assetType: {
          assetClass: "ERC20",
          contract: toEVMAddress(it.testErc20.options.address!),
        },
        value: toBigNumber("1"),
      },
      take: {
        assetType: {
          assetClass: "CRYPTO_PUNKS",
          contract: toEVMAddress(it.punksMarket.options.address!),
          tokenId: punkId,
        },
        value: toBigNumber("1"),
      },
      salt: randomWord(),
      type: "RARIBLE_V2",
      data: {
        dataType: "RARIBLE_V2_DATA_V1",
        payouts: [],
        originFees: [],
      },
    }

    console.log("before sign order")
    const signature = await signOrder(buyerEthereum, getConfig, left)

    const finalOrder = { ...left, signature }

    const filler = new OrderFiller(sellerEthereum, send, getConfig, getApisSeller, getBaseOrderFee, env)

    console.log("before accept bid")
    // await delay(5000)
    const acceptBidTx = await filler.acceptBid({ order: finalOrder, amount: 1, originFees: [] })
    await acceptBidTx?.wait()

    console.log("after accept bid")
    const ownerAddress = await it.punksMarket.methods.punkIndexToAddress(punkId).call()

    expect(ownerAddress.toLowerCase()).toBe(buyerAddress.toLowerCase())
  })

  test(`[${buyerEthereum.constructor.name}] buy erc-1155 <-> ETH with calldata flag`, async () => {
    const tokenId = "5123400"
    await sentTx(it.testErc1155.methods.mint(sellerAddress, tokenId, 10, "0x"), { from: buyerAddress })

    const left: SimpleOrder = {
      make: {
        assetType: {
          assetClass: "ERC1155",
          contract: toEVMAddress(it.testErc1155.options.address!),
          tokenId: toBigNumber(tokenId),
        },
        value: toBigNumber("5"),
      },
      maker: sellerAddress,
      take: {
        assetType: {
          assetClass: "ETH",
        },
        value: toBigNumber("1000000"),
      },
      salt: randomWord(),
      type: "RARIBLE_V2",
      data: {
        dataType: "RARIBLE_V2_DATA_V1",
        payouts: [],
        originFees: [],
      },
    }

    const signature = await signOrder(sellerEthereum, getConfig, left)

    const finalOrder = { ...left, signature }

    await sentTx(it.testErc1155.methods.setApprovalForAll(it.transferProxy.options.address!, true), {
      from: sellerAddress,
    })

    const marketplaceMarker = toBinary(`${ZERO_ADDRESS}00000001`)
    const sdkBuyer = createRaribleSdk(buyerEthereum, env, {
      marketplaceMarker,
    })
    const tx = await sdkBuyer.order.buy({ order: finalOrder, amount: 2, originFees: [] })
    expect(tx.data.endsWith(marketplaceMarker.concat(FILL_CALLDATA_TAG).slice(2))).toBe(true)
    await tx.wait()
  })

  test("buy erc-1155 <-> ETH with zero-price", async () => {
    const tokenId = "51234"
    await sentTx(it.testErc1155.methods.mint(sellerAddress, tokenId, 10, "0x"), { from: buyerAddress })

    const left: SimpleOrder = {
      make: {
        assetType: {
          assetClass: "ERC1155",
          contract: toEVMAddress(it.testErc1155.options.address),
          tokenId: toBigNumber(tokenId),
        },
        value: toBigNumber("5"),
      },
      maker: sellerAddress,
      take: {
        assetType: {
          assetClass: "ETH",
        },
        value: toBigNumber("0"),
      },
      salt: randomWord(),
      end: getEndDateAfterMonth(),
      type: "RARIBLE_V2",
      data: {
        dataType: "RARIBLE_V2_DATA_V2",
        payouts: [],
        originFees: [],
        isMakeFill: true,
      },
    }

    const signature = await signOrder(sellerEthereum, getConfig, left)

    const finalOrder = { ...left, signature }

    await sentTx(it.testErc1155.methods.setApprovalForAll(it.transferProxy.options.address, true), {
      from: sellerAddress,
    })

    const sdkBuyer = createRaribleSdk(buyerEthereum, env)
    const tx = await sdkBuyer.order.buy({ order: finalOrder, amount: 5, originFees: [] })
    await tx.wait()
  })

  test("partial buy erc-1155 <-> ETH with zero-price", async () => {
    const tokenId = "512345"
    await sentTx(it.testErc1155.methods.mint(sellerAddress, tokenId, 10, "0x"), { from: buyerAddress })

    const left: SimpleOrder = {
      make: {
        assetType: {
          assetClass: "ERC1155",
          contract: toEVMAddress(it.testErc1155.options.address),
          tokenId: toBigNumber(tokenId),
        },
        value: toBigNumber("5"),
      },
      maker: sellerAddress,
      take: {
        assetType: {
          assetClass: "ETH",
        },
        value: toBigNumber("0"),
      },
      salt: randomWord(),
      end: getEndDateAfterMonth(),
      type: "RARIBLE_V2",
      data: {
        dataType: "RARIBLE_V2_DATA_V2",
        payouts: [],
        originFees: [],
        isMakeFill: true,
      },
    }

    const signature = await signOrder(sellerEthereum, getConfig, left)

    const finalOrder = { ...left, signature }

    await sentTx(it.testErc1155.methods.setApprovalForAll(it.transferProxy.options.address, true), {
      from: sellerAddress,
    })

    const sdkBuyer = createRaribleSdk(buyerEthereum, env)
    const tx = await sdkBuyer.order.buy({ order: finalOrder, amount: 5, originFees: [] })
    await tx.wait()
  })
})
