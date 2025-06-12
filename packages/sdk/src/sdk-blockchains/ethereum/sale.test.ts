import { Web3v4Ethereum, Web3 } from "@rarible/web3-v4-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toCollectionId, toCurrencyId, toItemId, toOrderId, toUnionAddress, toWord } from "@rarible/types"
import { Blockchain, BlockchainGroup } from "@rarible/api-client"
import { id32 } from "@rarible/protocol-ethereum-sdk/build/common/id"
import { toPromises } from "@rarible/web3-ethereum/build/utils/to-promises"
import { LogsLevel } from "../../domain"
import { MintType } from "../../types/nft/mint/prepare"
import { awaitItem } from "../../common/test/await-item"
import { awaitOrderMakeStock } from "../../common/test/await-order"
import { OriginFeeSupport } from "../../types/order/fill/domain"
import { createSdk } from "../../common/test/create-sdk"
import { generateExpirationDate } from "../../common/suite/order"
import { convertEthereumToUnionAddress } from "./common"
import { DEV_PK_1 } from "./test/common"
import { EVMContractsTestSuite } from "./test/suite/contracts"
import { awaitErc1155Balance } from "./test/await-erc-1155-balance"
import { createE2eTestProvider, initProviders } from "./test/init-providers"
import { awaitForOwnership } from "./test/await-ownership"

describe("sale", () => {
  const { web32, ethereum1, ethereum2, ethereumWallet1, ethereumWallet2, wallet1, wallet2 } = initProviders({
    pk1: DEV_PK_1,
    pk2: "064b2a70a2932eb5b45c760b210a2bee579d94031a8c40bff05cfd9d800d6812",
  })
  const sdk1 = createSdk(ethereumWallet1, "development")
  const sdk2 = createSdk(ethereumWallet2, "development", {
    logs: LogsLevel.DISABLED,
    blockchain: {
      [BlockchainGroup.ETHEREUM]: {
        marketplaceMarker: "0x000000000000000000000000000000000000000000000009",
      },
    },
  })

  const testSuite = new EVMContractsTestSuite(Blockchain.ETHEREUM, ethereum1)
  const testSuite2 = new EVMContractsTestSuite(Blockchain.ETHEREUM, ethereum2)
  const erc721Address = testSuite.getContract("erc721_1").contractAddress
  const erc1155Address = testSuite.getContract("erc1155_1").contractAddress

  const erc20 = testSuite.getContract("erc20_mintable_1")
  const erc20ContractAddress = erc20.contractAddress

  beforeAll(async () => {
    const wallet2Address = wallet2.getAddressString()
    await erc20.mintWei("10000000000000000", wallet2Address)
  })

  test("erc721 sell/buy by erc-20 token using getBuyTxData method", async () => {
    const wallet1Address = wallet1.getAddressString()

    const action = await sdk1.nft.mint.prepare({
      collectionId: toCollectionId(erc721Address),
    })
    const result = await action.submit({
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      creators: [
        {
          account: convertEthereumToUnionAddress(wallet1Address, Blockchain.ETHEREUM),
          value: 10000,
        },
      ],
      royalties: [],
      lazyMint: false,
      supply: 1,
    })
    if (result.type === MintType.ON_CHAIN) {
      await result.transaction.wait()
    }

    await awaitItem(sdk1, result.itemId)

    const sellAction = await sdk1.order.sell.prepare({ itemId: result.itemId })
    const orderId = await sellAction.submit({
      amount: 1,
      price: "2",
      currency: {
        "@type": "ERC20",
        contract: erc20ContractAddress,
      },
      expirationDate: generateExpirationDate(),
    })

    const nextStock = "1"
    const order = await awaitOrderMakeStock(sdk1, orderId, nextStock)
    expect(order.makeStock.toString()).toEqual(nextStock)

    await sdk1.apis.order.getOrderById({ id: orderId })

    const txData = await sdk1.ethereum?.getBuyTxData({
      request: {
        orderId,
        amount: 1,
      },
      from: convertEthereumToUnionAddress(await ethereumWallet2.ethereum.getFrom()),
    })

    if (!txData) throw new Error("Ethereum SDK is not init")

    //approve tx to exchange transfer proxy in dev network
    const devTransferProxyAddress = "0xa721f321f2C3838e6812b1c8b1693e3B1f6a38Bc"
    await testSuite2.getContract("erc20_mintable_1").approveWei("10000000000000000", devTransferProxyAddress)

    console.log("value", (await txData).value)
    const promiEvent = web32.eth.sendTransaction({
      from: await ethereumWallet2.ethereum.getFrom(),
      to: txData.to,
      data: txData.data,
      value: txData.value,
    })
    //wait for confirming transaction
    const promises = toPromises(promiEvent as any)
    await promises.receipt

    const nextStock2 = "0"
    const order2 = await awaitOrderMakeStock(sdk1, orderId, nextStock2)
    expect(order2.makeStock.toString()).toEqual(nextStock2)
    await awaitForOwnership(sdk2, result.itemId, await ethereum2.getFrom())
  })

  test("erc721 sell/buy using erc-20", async () => {
    const wallet1Address = wallet1.getAddressString()

    const action = await sdk1.nft.mint.prepare({
      collectionId: toCollectionId(erc721Address),
    })
    const result = await action.submit({
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      creators: [
        {
          account: convertEthereumToUnionAddress(wallet1Address, Blockchain.ETHEREUM),
          value: 10000,
        },
      ],
      royalties: [],
      lazyMint: false,
      supply: 1,
    })
    if (result.type === MintType.ON_CHAIN) {
      await result.transaction.wait()
    }

    await awaitItem(sdk1, result.itemId)

    const sellAction = await sdk1.order.sell.prepare({ itemId: result.itemId })
    const orderId = await sellAction.submit({
      amount: 1,
      price: "2",
      currency: {
        "@type": "ERC20",
        contract: erc20ContractAddress,
      },
      expirationDate: generateExpirationDate(),
    })

    const nextStock = "1"
    const order = await awaitOrderMakeStock(sdk1, orderId, nextStock)
    expect(order.makeStock.toString()).toEqual(nextStock)

    const updateAction = await sdk1.order.sellUpdate.prepare({ orderId })
    await updateAction.submit({ price: "1" })

    await sdk1.apis.order.getOrderById({ id: orderId })

    const fillAction = await sdk2.order.buy.prepare({ orderId })

    const tx = await fillAction.submit({ amount: 1 })
    await tx.wait()

    const nextStock2 = "0"
    const order2 = await awaitOrderMakeStock(sdk1, orderId, nextStock2)
    expect(order2.makeStock.toString()).toEqual(nextStock2)
  })

  test("erc721 sell/buy using erc-20 with calldata", async () => {
    const wallet1Address = wallet1.getAddressString()

    const action = await sdk1.nft.mint.prepare({
      collectionId: toCollectionId(erc721Address),
    })
    const result = await action.submit({
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      creators: [
        {
          account: convertEthereumToUnionAddress(wallet1Address, Blockchain.ETHEREUM),
          value: 10000,
        },
      ],
      royalties: [],
      lazyMint: false,
      supply: 1,
    })
    if (result.type === MintType.ON_CHAIN) {
      await result.transaction.wait()
    }

    await awaitItem(sdk1, result.itemId)

    const sellAction = await sdk1.order.sell.prepare({ itemId: result.itemId })
    const orderId = await sellAction.submit({
      amount: 1,
      price: "2",
      currency: {
        "@type": "ERC20",
        contract: erc20ContractAddress,
      },
      expirationDate: generateExpirationDate(),
    })

    const nextStock = "1"
    const order = await awaitOrderMakeStock(sdk1, orderId, nextStock)
    expect(order.makeStock.toString()).toEqual(nextStock)

    const fillAction = await sdk2.order.buy.prepare({ orderId })

    const tx = await fillAction.submit({ amount: 1 })
    await tx.wait()

    const nextStock2 = "0"
    const order2 = await awaitOrderMakeStock(sdk1, orderId, nextStock2)
    expect(order2.makeStock.toString()).toEqual(nextStock2)
    expect(tx.transaction.data.endsWith("00000000000000000000000000000000000000000000000909616c6c64617461")).toBe(true)
  })

  test("erc721 sell/buy using erc-20 with order object", async () => {
    const wallet1Address = wallet1.getAddressString()

    const action = await sdk1.nft.mint.prepare({
      collectionId: toCollectionId(erc721Address),
    })
    const result = await action.submit({
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      creators: [
        {
          account: convertEthereumToUnionAddress(wallet1Address, Blockchain.ETHEREUM),
          value: 10000,
        },
      ],
      royalties: [],
      lazyMint: false,
      supply: 1,
    })
    if (result.type === MintType.ON_CHAIN) {
      await result.transaction.wait()
    }

    await awaitItem(sdk1, result.itemId)

    const sellAction = await sdk1.order.sell.prepare({ itemId: result.itemId })
    const orderId = await sellAction.submit({
      amount: 1,
      price: "2",
      currency: {
        "@type": "ERC20",
        contract: erc20ContractAddress,
      },
      expirationDate: generateExpirationDate(),
    })

    const nextStock = "1"
    const order = await awaitOrderMakeStock(sdk1, orderId, nextStock)
    expect(order.makeStock.toString()).toEqual(nextStock)

    const fillAction = await sdk2.order.buy.prepare({ order })

    const tx = await fillAction.submit({ amount: 1 })
    await tx.wait()

    const nextStock2 = "0"
    const order2 = await awaitOrderMakeStock(sdk1, orderId, nextStock2)
    expect(order2.makeStock.toString()).toEqual(nextStock2)
  })

  test("erc721 sell/buy using erc-20 throw error with outdated expiration date", async () => {
    const wallet1Address = wallet1.getAddressString()

    const action = await sdk1.nft.mint.prepare({
      collectionId: toCollectionId(erc721Address),
    })
    const result = await action.submit({
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      creators: [
        {
          account: convertEthereumToUnionAddress(wallet1Address, Blockchain.ETHEREUM),
          value: 10000,
        },
      ],
      royalties: [],
      lazyMint: false,
      supply: 1,
    })
    if (result.type === MintType.ON_CHAIN) {
      await result.transaction.wait()
    }

    await awaitItem(sdk1, result.itemId)
    const sellAction = await sdk1.order.sell.prepare({ itemId: result.itemId })
    const orderId = await sellAction.submit({
      amount: 1,
      price: "2",
      currency: {
        "@type": "ERC20",
        contract: erc20ContractAddress,
      },
      expirationDate: new Date(),
    })

    const nextStock = "1"
    const order = await awaitOrderMakeStock(sdk1, orderId, nextStock)
    expect(order.makeStock.toString()).toEqual(nextStock)

    let errorMessage
    try {
      const fillAction = await sdk2.order.buy.prepare({ orderId })
      const tx = await fillAction.submit({ amount: 1 })
      await tx.wait()
    } catch (e: any) {
      errorMessage = e
    }
    expect(errorMessage).toBeTruthy()
  })

  test("erc721 sell/buy using erc-20 with CurrencyId", async () => {
    const wallet1Address = wallet1.getAddressString()

    const action = await sdk1.nft.mint.prepare({
      collectionId: toCollectionId(erc721Address),
    })
    const result = await action.submit({
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      creators: [
        {
          account: convertEthereumToUnionAddress(wallet1Address, Blockchain.ETHEREUM),
          value: 10000,
        },
      ],
      royalties: [],
      lazyMint: false,
      supply: 1,
    })
    if (result.type === MintType.ON_CHAIN) {
      await result.transaction.wait()
    }

    await awaitItem(sdk1, result.itemId)

    const sellAction = await sdk1.order.sell.prepare({ itemId: result.itemId })
    const orderId = await sellAction.submit({
      amount: 1,
      price: "2",
      currency: toCurrencyId(erc20ContractAddress),
      expirationDate: generateExpirationDate(),
    })

    const nextStock = "1"
    const order = await awaitOrderMakeStock(sdk1, orderId, nextStock)
    expect(order.makeStock.toString()).toEqual(nextStock)

    const fillAction = await sdk2.order.buy.prepare({ order })

    const tx = await fillAction.submit({ amount: 1 })
    await tx.wait()

    const nextStock2 = "0"
    const order2 = await awaitOrderMakeStock(sdk1, orderId, nextStock2)
    expect(order2.makeStock.toString()).toEqual(nextStock2)
  })

  test("erc721 sell/buy using erc-20 with CurrencyId with basic functions", async () => {
    const wallet1Address = wallet1.getAddressString()

    const result = await sdk1.nft.mint({
      collectionId: toCollectionId(erc721Address),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      creators: [
        {
          account: convertEthereumToUnionAddress(wallet1Address, Blockchain.ETHEREUM),
          value: 10000,
        },
      ],
      royalties: [],
    })
    await result.transaction.wait()

    await awaitItem(sdk1, result.itemId)

    const orderId = await sdk1.order.sell({
      itemId: result.itemId,
      amount: 1,
      price: "2",
      currency: toCurrencyId(erc20ContractAddress),
      expirationDate: generateExpirationDate(),
    })

    const nextStock = "1"
    const order = await awaitOrderMakeStock(sdk1, orderId, nextStock)
    expect(order.makeStock.toString()).toEqual(nextStock)

    const tx = await sdk2.order.buy({
      order,
      amount: 1,
    })

    await tx.wait()

    const nextStock2 = "0"
    const order2 = await awaitOrderMakeStock(sdk1, orderId, nextStock2)
    expect(order2.makeStock.toString()).toEqual(nextStock2)
  })

  test("erc1155 sell/buy zero price order using erc-20 with CurrencyId with basic functions", async () => {
    const wallet1Address = wallet1.getAddressString()

    const result = await sdk1.nft.mint({
      collectionId: toCollectionId(erc1155Address),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      creators: [
        {
          account: convertEthereumToUnionAddress(wallet1Address, Blockchain.ETHEREUM),
          value: 10000,
        },
      ],
      supply: 5,
      royalties: [],
    })
    await result.transaction.wait()

    await awaitItem(sdk1, result.itemId)

    const orderId = await sdk1.order.sell({
      itemId: result.itemId,
      amount: 5,
      price: "0",
      currency: toCurrencyId(erc20ContractAddress),
      expirationDate: generateExpirationDate(),
    })

    const nextStock = "5"
    const order = await awaitOrderMakeStock(sdk1, orderId, nextStock)
    expect(order.makeStock.toString()).toEqual(nextStock)

    const tx = await sdk2.order.buy({
      order,
      amount: 2,
    })

    await tx.wait()

    const nextStock2 = "3"
    await awaitOrderMakeStock(sdk1, orderId, nextStock2)
    await awaitErc1155Balance(
      ethereumWallet2,
      result.itemId,
      toUnionAddress(`ETHEREUM:${await ethereum2.getFrom()}`),
      2,
    )
  })

  test("get future order fees", async () => {
    const fees = await sdk1.restriction.getFutureOrderFees(
      toItemId(
        "ETHEREUM:0x1AF7A7555263F275433c6Bb0b8FdCD231F89B1D7:15754214302034704911334786657881932847148102202883437712117637319024858628267",
      ),
    )
    expect(fees.originFeeSupport).toBe(OriginFeeSupport.FULL)
    expect(fees.baseFee).toBe(0)
  })
})

describe.skip("buy item with opensea order", () => {
  const { provider } = createE2eTestProvider("0x00120de4b1518cf1f16dc1b02f6b4a8ac29e870174cb1d8575f578480930250a", {
    rpcUrl: "https://node-rinkeby.rarible.com",
    networkId: 4,
  })

  const web3 = new Web3(provider)
  const ethereum1 = new Web3v4Ethereum({ web3 })
  const meta = toWord(id32("CUSTOM_META"))
  const sdk1 = createSdk(new EthereumWallet(ethereum1), "testnet", {
    logs: LogsLevel.DISABLED,
    blockchain: {
      [BlockchainGroup.ETHEREUM]: {
        marketplaceMarker: "0x000000000000000000000000000000000000000000000009",
        [Blockchain.ETHEREUM]: {
          openseaOrdersMetadata: meta,
        },
      },
    },
  })

  test("buy opensea item with specifying origin", async () => {
    const orderId = toOrderId("ETHEREUM:0x298fab77f8c8af0f4adf014570287689f7b9228307eaaf657a7446bc8eab0bc1")

    const fillAction = await sdk1.order.buy.prepare({ orderId })
    const tx = await fillAction.submit({ amount: 1 })
    await tx.wait()
  })

  test("buy item with seaport", async () => {
    const orderId = toOrderId("ETHEREUM:0xefc670c6a0a5659c623a6c7163f715317cbf44139119d9ebe2d636a0f1754776")
    const itemId = toItemId(
      "ETHEREUM:0x1af7a7555263f275433c6bb0b8fdcd231f89b1d7:15754214302034704911334786657881932847148102202883437712117637319024858628148",
    )
    const fillAction = await sdk1.order.buy.prepare({ orderId })
    const tx = await fillAction.submit({ amount: 1 })
    await tx.wait()
    await awaitForOwnership(sdk1, itemId, await ethereum1.getFrom())
  })

  test("buy item with looksrare order", async () => {
    const orderId = toOrderId("ETHEREUM:0xebec9809427f03c5182ad4f463d3b66149e1272a2db691323f14d1b0c675d406")
    const itemId = toItemId(
      "ETHEREUM:0x1AF7A7555263F275433c6Bb0b8FdCD231F89B1D7:15754214302034704911334786657881932847148102202883437712117637319024858628267",
    )
    const fillAction = await sdk1.order.buy.prepare({ orderId })
    const tx = await fillAction.submit({ amount: 1 })
    await tx.wait()
    await awaitForOwnership(sdk1, itemId, await ethereum1.getFrom())
  })
})
