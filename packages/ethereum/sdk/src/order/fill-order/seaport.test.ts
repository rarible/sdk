import { Web3Ethereum, Web3 } from "@rarible/web3-ethereum"
import type { SeaportV1Order } from "@rarible/ethereum-api-client/build/models/Order"
import { toEVMAddress, toBinary, EVM_ZERO_ADDRESS } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import { toBn } from "@rarible/utils/build/bn"
import { EthersEthereum, EthersWeb3ProviderEthereum } from "@rarible/ethers-ethereum"
import { ethers } from "ethers"
import type { EVMAddress } from "@rarible/types"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { RaribleSdk } from "../../index"
import { createRaribleSdk } from "../../index"
import { createSeaportOrder } from "../test/order-opensea"
import { createErc1155V2Collection, createErc721V3Collection } from "../../common/mint"
import { MintResponseTypeEnum } from "../../nft/mint"
import { delay } from "../../common/retry"
import { awaitOrder } from "../test/await-order"
import { awaitOwnership } from "../test/await-ownership"
import { getOpenseaEthTakeData } from "../test/get-opensea-take-data"
import { getEthereumConfig } from "../../config"
import type { SendFunction } from "../../common/send-transaction"
import { getSimpleSendWithInjects } from "../../common/send-transaction"
import { FILL_CALLDATA_TAG } from "../../config/common"
import { getE2EConfigByNetwork } from "../../common/test/test-credentials"
import { getApis as getApisTemplate } from "../../common/apis"
import type { EthereumNetwork } from "../../types"
import { createE2eTestProvider } from "../../common/test/create-test-providers"
import { ItemType } from "./seaport-utils/constants"
import type { CreateInputItem } from "./seaport-utils/types"
import { SeaportOrderHandler } from "./seaport"

//createSeaportOrder may return 400 error, try again
describe.skip("seaport", () => {
  const goerli = getE2EConfigByNetwork("sepolia")
  const { provider: providerBuyer, web3v4Ethereum: ethereum } = createE2eTestProvider(
    "0x00120de4b1518cf1f16dc1b02f6b4a8ac29e870174cb1d8575f578480930250a",
    goerli,
  )
  const { provider: providerSeller } = createE2eTestProvider(
    "0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c",
    goerli,
  )
  const { wallet: feeWallet } = createE2eTestProvider(undefined, goerli)
  const web3Seller = new Web3(providerSeller)
  const ethereumSeller = new Web3Ethereum({ web3: web3Seller, gas: 3000000 })

  const env = "testnet" as const
  const buyerWeb3 = new Web3Ethereum({ web3: new Web3(providerBuyer), gas: 3000000 })
  const ethersWeb3Provider = new ethers.providers.Web3Provider(providerBuyer as any)
  const buyerEthersWeb3Provider = new EthersWeb3ProviderEthereum(ethersWeb3Provider)
  const buyerEthersEthereum = new EthersEthereum(
    new ethers.Wallet("0x00120de4b1518cf1f16dc1b02f6b4a8ac29e870174cb1d8575f578480930250a", ethersWeb3Provider),
  )
  const sdkBuyer = createRaribleSdk(buyerWeb3, env)
  const sdkSeller = createRaribleSdk(ethereumSeller, env)

  const getApisBuyer = getApisTemplate.bind(null, ethereum, env)

  const rinkebyErc721V3ContractAddress = toEVMAddress("0x6ede7f3c26975aad32a475e1021d8f6f39c89d82")
  const goerliErc1155V2ContractAddress = toEVMAddress("0xC87FA76c704fE8dE4BC727ef337907BF1e316418")
  const originFeeAddress = toEVMAddress(feeWallet.getAddressString())

  const config = getEthereumConfig("testnet")
  const getConfig = async () => config

  const send = getSimpleSendWithInjects()

  const seaportBuyerOrderHandler = new SeaportOrderHandler(
    buyerWeb3,
    send,
    getConfig,
    getApisBuyer,
    async () => 0,
    "testnet",
  )

  test("get buy tx successfully", async () => {
    const order = await sdkBuyer.apis.order.getValidatedOrderByHash({
      hash: "0x6c9909349c21e1d9fa6f8209ac03b1689dbf55864d126723398e407529145aa4",
    })
    await sdkBuyer.order.getBuyTxData({
      request: { order: order as any, amount: 1, originFees: [] },
      from: toEVMAddress(await buyerWeb3.getFrom()),
    })
  })

  test("get signature", async () => {
    try {
      await seaportBuyerOrderHandler.getSignature({
        hash: "0xc3fb0c2ce34d2758ccd163ecea11a4809a22374d1f13f1105d8161d09f67195f",
        protocol: "0x00000000000001ad428e4906ae43d8f9852d0dd6",
      })
    } catch (e: any) {
      expect(e.message).toBe("Order is not active or cancelled")
    }
    // Error when generating fulfillment data
  })

  test("fill order ERC-721 <-> ETH", async () => {
    const accountAddressBuyer = toEVMAddress(await ethereum.getFrom())
    console.log("accountAddressBuyer", accountAddressBuyer)
    console.log("seller", await ethereumSeller.getFrom())

    const sellItem = await sdkSeller.nft.mint({
      collection: createErc721V3Collection(rinkebyErc721V3ContractAddress),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      royalties: [],
      lazy: false,
    })
    if (sellItem.type === MintResponseTypeEnum.ON_CHAIN) {
      await sellItem.transaction.wait()
    }

    await delay(10000)
    const make = {
      itemType: ItemType.ERC721,
      token: sellItem.contract,
      identifier: sellItem.tokenId,
    } as const
    const take = getOpenseaEthTakeData("10000000000")
    const orderHash = await createSeaportOrder(ethereumSeller, send, make, take)

    const order = await awaitOrder(sdkBuyer, orderHash)

    const tx = await sdkBuyer.order.buy({
      order: order as SeaportV1Order,
      amount: 2,
      originFees: [
        {
          account: toEVMAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
          value: 20,
        },
        {
          account: toEVMAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
          value: 50,
        },
      ],
    })
    console.log("pending tx", tx)
    await tx.wait()
    console.log("success", tx)
    // await awaitOwnership(sdkBuyer, sellItem.itemId, accountAddressBuyer, "2")

    const fee = seaportBuyerOrderHandler.getOrderFee()
    expect(fee).toBe(0)
  })

  test("fill order ERC-1155 <-> ETH", async () => {
    const accountAddress = await ethereumSeller.getFrom()
    const accountAddressBuyer = toEVMAddress(await ethereum.getFrom())

    const sellItem = await sdkSeller.nft.mint({
      collection: createErc1155V2Collection(goerliErc1155V2ContractAddress),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      royalties: [],
      supply: 100,
      creators: [{ account: toEVMAddress(accountAddress), value: 10000 }],
      lazy: false,
    })
    if (sellItem.type === MintResponseTypeEnum.ON_CHAIN) {
      await sellItem.transaction.wait()
    }

    await delay(10000)
    const make: CreateInputItem = {
      itemType: ItemType.ERC1155,
      token: sellItem.contract,
      identifier: sellItem.tokenId,
      amount: "10",
    } as const
    const take = getOpenseaEthTakeData("10000000000")
    const orderHash = await createSeaportOrder(ethereumSeller, send, make, take)

    const order = await awaitOrder(sdkBuyer, orderHash)
    const tx = await sdkBuyer.order.buy({
      order: order as SeaportV1Order,
      amount: 2,
    })
    await tx.wait()

    await awaitOwnership(sdkBuyer, sellItem.itemId, accountAddressBuyer, "2")
  })

  test("fill order ERC-1155 <-> ETH with restricted partial fill", async () => {
    const accountAddress = await ethereumSeller.getFrom()

    const sellItem = await sdkSeller.nft.mint({
      collection: createErc1155V2Collection(goerliErc1155V2ContractAddress),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      royalties: [],
      supply: 100,
      creators: [{ account: toEVMAddress(accountAddress), value: 10000 }],
      lazy: false,
    })
    if (sellItem.type === MintResponseTypeEnum.ON_CHAIN) {
      await sellItem.transaction.wait()
    }

    await delay(10000)
    const make: CreateInputItem = {
      itemType: ItemType.ERC1155,
      token: sellItem.contract,
      identifier: sellItem.tokenId,
      amount: "10",
    } as const
    const take = getOpenseaEthTakeData("10000000000")
    const orderHash = await createSeaportOrder(ethereumSeller, send, make, take)

    const order = await awaitOrder(sdkBuyer, orderHash)
    const buyResponse = sdkBuyer.order.buy({
      order: order as SeaportV1Order,
      amount: 2,
    })
    await expect(buyResponse).rejects.toThrow("Order is not supported partial fill")
  })

  test("fill order ERC-1155 <-> ETH with origin fees", async () => {
    const accountAddress = await ethereumSeller.getFrom()
    const accountAddressBuyer = toEVMAddress(await ethereum.getFrom())

    const sellItem = await sdkSeller.nft.mint({
      collection: createErc1155V2Collection(goerliErc1155V2ContractAddress),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      royalties: [],
      supply: 100,
      creators: [{ account: toEVMAddress(accountAddress), value: 10000 }],
      lazy: false,
    })
    if (sellItem.type === MintResponseTypeEnum.ON_CHAIN) {
      await sellItem.transaction.wait()
    }

    await delay(10000)
    const make: CreateInputItem = {
      itemType: ItemType.ERC1155,
      token: sellItem.contract,
      identifier: sellItem.tokenId,
      amount: "10",
    } as const
    const take = getOpenseaEthTakeData("10000000000")

    const orderHash = await createSeaportOrder(ethereumSeller, send, make, take)
    const order = await awaitOrder(sdkBuyer, orderHash)

    const feeAddressBalanceStart = await sdkSeller.balances.getBalance(originFeeAddress, { assetClass: "ETH" })

    const tx = await sdkBuyer.order.buy({
      order: order as SeaportV1Order,
      amount: 5,
      originFees: [
        {
          account: originFeeAddress,
          value: 500,
        },
        {
          account: originFeeAddress,
          value: 500,
        },
      ],
    })
    await tx.wait()

    await awaitOwnership(sdkBuyer, sellItem.itemId, accountAddressBuyer, "5")
    const feeAddressBalanceFinish = await sdkSeller.balances.getBalance(originFeeAddress, { assetClass: "ETH" })

    expect(toBn(feeAddressBalanceFinish).minus(feeAddressBalanceStart).toString()).toBe("0.0000000005")
  })

  test("fill order ERC-1155 <-> ERC-20 (WETH) with origin fees", async () => {
    const accountAddress = await ethereumSeller.getFrom()
    const accountAddressBuyer = toEVMAddress(await ethereum.getFrom())

    const sellItem = await sdkSeller.nft.mint({
      collection: createErc1155V2Collection(goerliErc1155V2ContractAddress),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      royalties: [],
      supply: 100,
      creators: [{ account: toEVMAddress(accountAddress), value: 10000 }],
      lazy: false,
    })
    if (sellItem.type === MintResponseTypeEnum.ON_CHAIN) {
      await sellItem.transaction.wait()
    }

    await delay(20000)
    const make: CreateInputItem = {
      itemType: ItemType.ERC1155,
      token: sellItem.contract,
      identifier: sellItem.tokenId,
      amount: "10",
    } as const
    const take = getOpenseaWethTakeData("100000")

    const wethAssetType = {
      assetClass: "ERC20",
      contract: toEVMAddress("0xc778417e063141139fce010982780140aa0cd5ab"),
    } as const
    const feeAddressBalanceStart = await sdkSeller.balances.getBalance(originFeeAddress, wethAssetType)
    const orderHash = await createSeaportOrder(ethereumSeller, send, make, take)
    const order = await awaitOrder(sdkBuyer, orderHash)

    const buyerBalanceStart = await sdkSeller.balances.getBalance(accountAddressBuyer, wethAssetType)
    const tx = await sdkBuyer.order.buy({
      order: order as SeaportV1Order,
      amount: 10,
      originFees: [
        {
          account: originFeeAddress,
          value: 1000,
        },
      ],
    })
    await tx.wait()

    await awaitOwnership(sdkBuyer, sellItem.itemId, accountAddressBuyer, "10")

    const buyerBalanceFinish = await sdkSeller.balances.getBalance(accountAddressBuyer, wethAssetType)
    const feeAddressBalanceFinish = await sdkSeller.balances.getBalance(originFeeAddress, wethAssetType)

    expect(toBn(feeAddressBalanceFinish).minus(feeAddressBalanceStart).toString()).toBe("0.00000000000001")
    expect(toBn(buyerBalanceStart).minus(buyerBalanceFinish).toString()).toBe("0.00000000000011")
  })

  test("fill order ERC-721 <-> ERC-20 (WETH)", async () => {
    const accountAddressBuyer = toEVMAddress(await ethereum.getFrom())

    const sellItem = await sdkSeller.nft.mint({
      collection: createErc721V3Collection(rinkebyErc721V3ContractAddress),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      royalties: [],
      lazy: false,
    })
    if (sellItem.type === MintResponseTypeEnum.ON_CHAIN) {
      await sellItem.transaction.wait()
    }

    await delay(10000)
    const make = {
      itemType: ItemType.ERC721,
      token: sellItem.contract,
      identifier: sellItem.tokenId,
    } as const
    const take = getOpenseaWethTakeData("10000000000")
    const orderHash = await createSeaportOrder(ethereumSeller, send, make, take)

    const order = await awaitOrder(sdkBuyer, orderHash)

    const tx = await sdkBuyer.order.buy({
      order: order as SeaportV1Order,
      amount: 1,
    })
    await tx.wait()

    await awaitOwnership(sdkBuyer, sellItem.itemId, accountAddressBuyer, "1")
  })

  test.each([buyerEthersWeb3Provider, buyerEthersEthereum, buyerWeb3])(
    "fill order ERC-721 <-> ETH with calldata flag",
    async ethereum => {
      const accountAddressBuyer = toEVMAddress(await buyerEthersEthereum.getFrom())
      console.log("accountAddressBuyer", accountAddressBuyer)
      console.log("seller", await ethereumSeller.getFrom())

      const marketplaceMarker = toBinary(`${EVM_ZERO_ADDRESS}00000009`)
      const orderHash = await mintAndCreateSeaportOrder(sdkSeller, ethereumSeller, send, rinkebyErc721V3ContractAddress)
      const sdkBuyer = createRaribleSdk(ethereum, "testnet", {
        marketplaceMarker,
      })

      const order = await awaitOrder(sdkBuyer, orderHash)

      const tx = await sdkBuyer.order.buy({
        order: order as SeaportV1Order,
        amount: 1,
      })
      console.log("tx", tx)
      const fullAdditionalData = marketplaceMarker.concat(FILL_CALLDATA_TAG).slice(2)
      expect(tx.data.endsWith(fullAdditionalData)).toBe(true)
      await tx.wait()
    },
  )

  test("test convertOriginFeesToTips with erc1155 partial", async () => {
    const request = {
      order: {
        make: {
          assetType: {
            assetClass: "ERC1155",
            contract: "",
          },
          value: toBn(10),
        },
        take: {
          assetType: {
            assetClass: "ETH",
          },
          value: 1000,
        },
      },
      amount: 2,
      originFees: [
        {
          account: "0x0",
          value: 1000,
        },
        {
          account: "0x0",
          value: 500,
        },
      ],
    } as any
    const tips: any = seaportBuyerOrderHandler.convertOriginFeesToTips(request)
    //2 (amount) * 100 (pricePerOne) * 10% = 20
    expect(tips[0].amount).toBe("20")
    //2 (amount) * 100 (pricePerOne) * 5% = 10
    expect(tips[1].amount).toBe("10")
  })

  test("test convertOriginFeesToTips with 721", async () => {
    const request = {
      order: {
        make: {
          assetType: {
            assetClass: "ERC721",
            contract: "",
          },
          value: toBn(1),
        },
        take: {
          assetType: {
            assetClass: "ETH",
          },
          value: 1000,
        },
      },
      amount: 1,
      originFees: [
        {
          account: "0x0",
          value: 1000,
        },
        {
          account: "0x0",
          value: 500,
        },
      ],
    } as any
    const tips: any = seaportBuyerOrderHandler.convertOriginFeesToTips(request)
    expect(tips![0].amount).toBe("100")
    expect(tips![1].amount).toBe("50")
  })
})

describe.skip("polygon seaport", () => {
  const { provider: providerBuyer } = createE2eTestProvider(
    "0x00120de4b1518cf1f16dc1b02f6b4a8ac29e870174cb1d8575f578480930250a",
    getE2EConfigByNetwork("amoy"),
  )
  const web3 = new Web3(providerBuyer as any)

  const ethereum = new Web3Ethereum({ web3, gas: 3000000 })

  const env: EthereumNetwork = "polygon"

  const config = getEthereumConfig(env)
  const getConfig = async () => config

  const send = getSimpleSendWithInjects()

  const getApis = getApisTemplate.bind(null, ethereum, env)

  const seaportBuyerOrderHandler = new SeaportOrderHandler(ethereum, send, getConfig, getApis, async () => 0, env)

  test("get signature", async () => {
    try {
      await seaportBuyerOrderHandler.getSignature({
        hash: "0xd92b55e75cc2d0e9f160f9e1e7a0c3146bd9405941d89408f3303844e4b7aff4",
        protocol: "0x00000000000001ad428e4906ae43d8f9852d0dd6",
      })
    } catch (e: any) {
      expect(e.message).toBe("Order is not active or cancelled")
    }
    // Error when generating fulfillment data
  })
})
function getOpenseaWethTakeData(amount: BigNumberValue) {
  const weth = "0xc778417e063141139fce010982780140aa0cd5ab"
  const sellerAmount = toBn(amount).multipliedBy("0.975")
  const feeRecipientAmount = toBn(amount).multipliedBy("0.025")
  return [
    {
      token: weth,
      amount: sellerAmount.toString(),
      endAmount: sellerAmount.toString(),
    },
    {
      token: weth,
      amount: feeRecipientAmount.toString(),
      endAmount: feeRecipientAmount.toString(),
      recipient: "0x8de9c5a032463c561423387a9648c5c7bcc5bc90",
    },
  ]
}

async function mintAndCreateSeaportOrder(
  sdkSeller: RaribleSdk,
  ethereumSeller: Ethereum,
  send: SendFunction,
  itemContract: EVMAddress,
): Promise<string> {
  const sellItem = await sdkSeller.nft.mint({
    collection: createErc721V3Collection(itemContract),
    uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
    lazy: false,
  })
  if (sellItem.type === MintResponseTypeEnum.ON_CHAIN) {
    await sellItem.transaction.wait()
  }

  await delay(10000)
  const make = {
    itemType: ItemType.ERC721,
    token: sellItem.contract,
    identifier: sellItem.tokenId,
  } as const
  const take = getOpenseaEthTakeData("10000000000")
  return createSeaportOrder(ethereumSeller, send, make, take)
}
