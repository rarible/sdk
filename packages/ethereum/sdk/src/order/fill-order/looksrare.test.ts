import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress, toBinary, ZERO_ADDRESS } from "@rarible/types"
import type { Erc1155AssetType, LooksRareOrder } from "@rarible/ethereum-api-client"
import { EthersEthereum, EthersWeb3ProviderEthereum } from "@rarible/ethers-ethereum"
import { ethers } from "ethers"
import { toBn } from "@rarible/utils/build/bn"
import { createRaribleSdk } from "../../index"
import { getEthereumConfig } from "../../config"
import { getSimpleSendWithInjects } from "../../common/send-transaction"
import { createErc1155V2Collection, createErc721V3Collection } from "../../common/mint"
import { MintResponseTypeEnum } from "../../nft/mint"
import { awaitOwnership } from "../test/await-ownership"
import { FILL_CALLDATA_TAG } from "../../config/common"
import { DEV_PK_1, DEV_PK_2, getE2EConfigByNetwork, getTestContract } from "../../common/test/test-credentials"
import { delay } from "../../common/retry"
import { ETHER_IN_WEI } from "../../common"
import { makeRaribleSellOrder } from "./looksrare-utils/create-order"

describe.skip("looksrare fill", () => {
  const goerli = getE2EConfigByNetwork("sepolia")
  const { provider: providerBuyer } = createE2eProvider(DEV_PK_1, goerli)
  const { provider: providerSeller } = createE2eProvider(DEV_PK_2, goerli)
  const { wallet: feeWallet } = createE2eProvider(undefined, goerli)
  const web3Seller = new Web3(providerSeller as any)
  const ethereumSeller = new Web3Ethereum({
    web3: web3Seller,
    gas: 3000000,
  })

  const buyerWeb3 = new Web3Ethereum({
    web3: new Web3(providerBuyer as any),
    gas: 3000000,
  })
  const buyerEthersWeb3Provider = new ethers.providers.Web3Provider(providerBuyer as any)

  const buyerEthersWeb3ProviderEthereum = new EthersWeb3ProviderEthereum(buyerEthersWeb3Provider)
  const buyerEthersEthereum = new EthersEthereum(new ethers.Wallet(DEV_PK_1, buyerEthersWeb3Provider))

  const env = "testnet" as const
  const sdkBuyer = createRaribleSdk(buyerWeb3, env)
  const sdkSeller = createRaribleSdk(ethereumSeller, env)

  const goerliErc721V3ContractAddress = getTestContract(env, "erc721V3")
  const goerliErc1155V2ContractAddress = getTestContract(env, "erc1155V2")
  const originFeeAddress = toAddress(feeWallet.getAddressString())

  const config = getEthereumConfig("testnet")

  const send = getSimpleSendWithInjects()

  test("fill erc 721", async () => {
    if (!config.exchange.looksrare) {
      throw new Error("Looksrare contract has not been set")
    }

    const sellItem = await sdkSeller.nft.mint({
      collection: createErc721V3Collection(goerliErc721V3ContractAddress),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      royalties: [],
      lazy: false,
    })
    if (sellItem.type === MintResponseTypeEnum.ON_CHAIN) {
      await sellItem.transaction.wait()
    }

    const sellOrder = await makeRaribleSellOrder(
      ethereumSeller,
      {
        assetClass: "ERC721",
        contract: sellItem.contract,
        tokenId: sellItem.tokenId,
      },
      send,
      toAddress(config.exchange.looksrare),
    )
    console.log("sellOrder", sellOrder)

    const tx = await sdkBuyer.order.buy({
      order: sellOrder,
      amount: 1,
      originFees: [
        {
          account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
          value: 100,
        },
        {
          account: toAddress("0xFc7b41fFC023bf3eab6553bf4881D45834EF1E8a"),
          value: 50,
        },
      ],
    })
    console.log(tx)
    await tx.wait()
  })

  test("fill erc 721 with royalties", async () => {
    if (!config.exchange.looksrare) {
      throw new Error("Looksrare contract has not been set")
    }

    const sellItem = await sdkSeller.nft.mint({
      collection: createErc721V3Collection(goerliErc721V3ContractAddress),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      royalties: [
        {
          account: toAddress("0xf6a21e471E07793C06D285CEa7AabA8B72029435"),
          value: 300,
        },
        {
          account: toAddress("0x2C3beA5Bd9adE1242Eecb327258a95516f9F45dE"),
          value: 400,
        },
      ],
      lazy: false,
    })
    if (sellItem.type === MintResponseTypeEnum.ON_CHAIN) {
      await sellItem.transaction.wait()
    }

    // const [royalty1BalanceOnStart, royalty2BalanceOnStart] = await getEthBalances([
    // 	"0xf6a21e471E07793C06D285CEa7AabA8B72029435",
    // 	"0x2C3beA5Bd9adE1242Eecb327258a95516f9F45dE",
    // ])
    console.log("sellitem", sellItem)

    const sellOrder = await makeRaribleSellOrder(
      ethereumSeller,
      {
        assetClass: "ERC721",
        contract: sellItem.contract,
        tokenId: sellItem.tokenId,
      },
      send,
      toAddress(config.exchange.looksrare),
    )
    console.log("sellOrder", sellOrder)

    const tx = await sdkBuyer.order.buy({
      order: sellOrder,
      amount: 1,
      addRoyalty: true,
      originFees: [
        {
          account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
          value: 1000,
        },
        {
          account: toAddress("0xFc7b41fFC023bf3eab6553bf4881D45834EF1E8a"),
          value: 2000,
        },
      ],
    })
    console.log(tx)
    await tx.wait()

    await delay(5000)

    // const [royalty1BalanceOnFinish, royalty2BalanceOnFinish] = await getEthBalances([
    // 	"0xf6a21e471E07793C06D285CEa7AabA8B72029435",
    // 	"0x2C3beA5Bd9adE1242Eecb327258a95516f9F45dE",
    // ])
  })

  test("fill erc 1155", async () => {
    if (!config.exchange.looksrare) {
      throw new Error("Looksrare contract has not been set")
    }

    const sellItem = await sdkSeller.nft.mint({
      collection: createErc1155V2Collection(goerliErc1155V2ContractAddress),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      royalties: [],
      lazy: false,
      supply: 10,
    })
    if (sellItem.type === MintResponseTypeEnum.ON_CHAIN) {
      await sellItem.transaction.wait()
    }

    const sellOrder = await makeRaribleSellOrder(
      ethereumSeller,
      {
        assetClass: "ERC1155",
        contract: sellItem.contract,
        tokenId: sellItem.tokenId,
      },
      send,
      toAddress(config.exchange.looksrare),
    )

    const seller = toAddress(await ethereumSeller.getFrom())
    const tx = await sdkBuyer.order.buy({
      order: sellOrder,
      amount: 1,
      originFees: [
        {
          account: seller,
          value: 1000,
        },
        {
          account: seller,
          value: 1000,
        },
      ],
    })
    await tx.wait()
  })

  test.skip("fill API order", async () => {
    const order = (await sdkBuyer.apis.order.getValidatedOrderByHash({
      hash: "0x3a7ff5ea8769b18d220f962d215bca2d2667131c2dde5593bb7302a12cd2dda4",
    })) as LooksRareOrder

    const tx = await sdkBuyer.order.buy({
      order,
      amount: 1,
      originFees: [
        {
          account: originFeeAddress,
          value: 1000,
        },
      ],
    })
    console.log("tx", tx)
    await tx.wait()

    const assetType = order.make.assetType as Erc1155AssetType
    const itemId = `${assetType.contract}:${assetType.tokenId}`
    await awaitOwnership(sdkBuyer, itemId, toAddress(await buyerWeb3.getFrom()), "1")
  })

  test.each([
    { provider: buyerWeb3, name: "web3" },
    { provider: buyerEthersWeb3ProviderEthereum, name: "ethersWeb3Ethereum" },
    { provider: buyerEthersEthereum, name: "ethersEthereum" },
  ])("fill erc 721 $name", async buyerEthereum => {
    if (!config.exchange.looksrare) {
      throw new Error("Looksrare contract has not been set")
    }
    const sellItem = await sdkSeller.nft.mint({
      collection: createErc721V3Collection(goerliErc721V3ContractAddress),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      royalties: [],
      lazy: false,
    })
    if (sellItem.type === MintResponseTypeEnum.ON_CHAIN) {
      await sellItem.transaction.wait()
    }

    const sellOrder = await makeRaribleSellOrder(
      ethereumSeller,
      {
        assetClass: "ERC721",
        contract: sellItem.contract,
        tokenId: sellItem.tokenId,
      },
      send,
      toAddress(config.exchange.looksrare),
    )
    console.log("sellOrder", sellOrder)

    const marketplaceMarker = toBinary(`${ZERO_ADDRESS}00000009`)
    const sdkBuyer = createRaribleSdk(buyerEthereum.provider, "testnet", {
      marketplaceMarker,
    })
    const tx = await sdkBuyer.order.buy({
      order: sellOrder,
      amount: 1,
      originFees: [
        {
          account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
          value: 100,
        },
        {
          account: toAddress("0xFc7b41fFC023bf3eab6553bf4881D45834EF1E8a"),
          value: 50,
        },
      ],
    })
    const fullAdditionalData = marketplaceMarker.concat(FILL_CALLDATA_TAG).slice(2)
    console.log(tx)
    expect(tx.data.endsWith(fullAdditionalData)).toBe(true)
    await tx.wait()
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function getEthBalances(addresses: string[]) {
    return Promise.all(
      addresses.map(async address => {
        return toBn(await buyerWeb3.getBalance(toAddress(address))).div(ETHER_IN_WEI)
      }),
    )
  }
})
