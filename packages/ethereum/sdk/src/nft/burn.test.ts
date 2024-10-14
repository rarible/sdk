import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import { toEVMAddress, toBigNumber } from "@rarible/types"
import { BigNumber, toBn } from "@rarible/utils"
import type { Ethereum } from "@rarible/ethereum-provider"
import { checkAssetType as checkAssetTypeTemplate } from "../order/check-asset-type"
import { getSendWithInjects } from "../common/send-transaction"
import { createTestProviders } from "../common/test/create-test-providers"
import {
  createErc1155V1Collection,
  createErc1155V2Collection,
  createErc721V2Collection,
  createErc721V3Collection,
} from "../common/mint"
import { getApis as getApisTemplate } from "../common/apis"
import { retry } from "../common/retry"
import { DEV_PK_1, getTestAPIKey, getTestContract } from "../common/test/test-credentials"
import { getEthereumConfig } from "../config"
import type { ERC1155RequestV1, ERC1155RequestV2, ERC721RequestV2, ERC721RequestV3 } from "./mint"
import { mint as mintTemplate, MintResponseTypeEnum } from "./mint"
import { signNft } from "./sign-nft"
import { burn as burnTemplate } from "./burn"
import { ERC1155VersionEnum, ERC721VersionEnum } from "./contracts/domain"
import { getErc721Contract } from "./contracts/erc721"
import { getErc1155Contract } from "./contracts/erc1155"
import { awaitOwnership } from "./test/await-ownership"

const { provider, wallet } = createE2eProvider(DEV_PK_1)
const { providers } = createTestProviders(provider, wallet)

/**
 * @group provider/dev
 */
describe.each(providers)("burn nfts", (ethereum: Ethereum) => {
  const testAddress = toEVMAddress(wallet.getAddressString())
  const env = "dev-ethereum" as const
  const config = getEthereumConfig(env)
  const getConfig = async () => config

  const sign = signNft.bind(null, ethereum, getConfig)
  const send = getSendWithInjects().bind(ethereum)
  const getApis = getApisTemplate.bind(null, ethereum, env, { apiKey: getTestAPIKey(env) })

  const checkAssetType = checkAssetTypeTemplate.bind(null, getApis)
  const mint = mintTemplate.bind(null, ethereum, send, sign, getApis)
  const burn = burnTemplate.bind(null, ethereum, send, checkAssetType, getApis)

  const e2eErc721V2ContractAddress = toEVMAddress("0x74bddd22a6b9d8fae5b2047af0e0af02c42b7dae")
  const e2eErc721V3ContractAddress = getTestContract(env, "erc721V3")
  const e2eErc1155V1ContractAddress = toEVMAddress("0x6919dc0cf9d4bcd89727113fbe33e3c24909d6f5")
  const e2eErc1155V2ContractAddress = getTestContract(env, "erc1155V2")

  test.skip("should burn ERC-721 v2 token", async () => {
    const testErc721 = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V2, e2eErc721V2ContractAddress)
    const minted = await mint({
      collection: createErc721V2Collection(e2eErc721V2ContractAddress),
      uri: "ipfs://ipfs/hash",
      royalties: [],
    } as ERC721RequestV2)
    if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
      await minted.transaction.wait()
    }
    await awaitOwnership(await getApis(), e2eErc721V2ContractAddress, minted.tokenId, testAddress)
    const testBalance = await testErc721.functionCall("balanceOf", testAddress).call()

    const burnTx = await burn({
      assetType: {
        contract: e2eErc721V2ContractAddress,
        tokenId: minted.tokenId,
      },
    })
    if (burnTx) {
      await burnTx.wait()
    }
    const testBalanceAfterBurn = await testErc721.functionCall("balanceOf", testAddress).call()
    console.log(testBalance.toString(), testBalanceAfterBurn.toString())
    expect(new BigNumber(testBalance.toString()).minus(testBalanceAfterBurn.toString()).toString()).toBe("1")
  })

  test("should burn ERC-721 v3 token", async () => {
    const testErc721 = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V3, e2eErc721V3ContractAddress)
    const minted = await mint({
      collection: createErc721V3Collection(e2eErc721V3ContractAddress),
      uri: "ipfs://ipfs/hash",
      creators: [{ account: toEVMAddress(testAddress), value: 10000 }],
      royalties: [],
      lazy: false,
    } as ERC721RequestV3)
    if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
      await minted.transaction.wait()
    }
    await awaitOwnership(await getApis(), e2eErc721V3ContractAddress, minted.tokenId, testAddress)
    const testBalance = await testErc721.functionCall("balanceOf", testAddress).call()

    const burnTx = await burn({
      assetType: {
        contract: e2eErc721V3ContractAddress,
        tokenId: minted.tokenId,
      },
    })
    if (burnTx) {
      await burnTx.wait()
    }
    const testBalanceAfterBurn = await testErc721.functionCall("balanceOf", testAddress).call()
    console.log(testBalance.toString(), testBalanceAfterBurn.toString())
    expect(new BigNumber(testBalance.toString()).minus(testBalanceAfterBurn.toString()).toString()).toBe("1")
  })

  test.skip("should burn ERC-1155 v1 token", async () => {
    const testErc1155 = await getErc1155Contract(ethereum, ERC1155VersionEnum.ERC1155V1, e2eErc1155V1ContractAddress)
    const minted = await mint({
      collection: createErc1155V1Collection(e2eErc1155V1ContractAddress),
      uri: "ipfs://ipfs/hash",
      royalties: [],
      supply: 100,
    } as ERC1155RequestV1)
    if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
      await minted.transaction.wait()
    }
    await awaitOwnership(await getApis(), e2eErc1155V1ContractAddress, minted.tokenId, testAddress)
    const burnTx = await burn({
      assetType: {
        contract: e2eErc1155V1ContractAddress,
        tokenId: minted.tokenId,
      },
      amount: toBigNumber("50"),
    })
    if (burnTx) {
      await burnTx.wait()
    }

    const testBalanceAfterBurn = await testErc1155.functionCall("balanceOf", testAddress, minted.tokenId).call()
    expect(toBn(testBalanceAfterBurn).toString()).toBe("50")
  })

  test("should burn ERC-1155 v2 token", async () => {
    const testErc1155 = await getErc1155Contract(ethereum, ERC1155VersionEnum.ERC1155V2, e2eErc1155V2ContractAddress)
    const minted = await mint({
      collection: createErc1155V2Collection(e2eErc1155V2ContractAddress),
      uri: "ipfs://ipfs/hash",
      royalties: [],
      creators: [{ account: toEVMAddress(testAddress), value: 10000 }],
      supply: 100,
      lazy: false,
    } as ERC1155RequestV2)
    if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
      await minted.transaction.wait()
    }
    await awaitOwnership(await getApis(), e2eErc1155V2ContractAddress, minted.tokenId, testAddress)
    const burnTx = await burn({
      assetType: {
        contract: e2eErc1155V2ContractAddress,
        tokenId: minted.tokenId,
      },
      amount: toBigNumber("50"),
    })
    if (burnTx) {
      await burnTx.wait()
    }

    const testBalanceAfterBurn = await testErc1155.functionCall("balanceOf", testAddress, minted.tokenId).call()
    expect(toBn(testBalanceAfterBurn).toString()).toBe("50")
  })

  test.skip("should burn ERC-721 v3 lazy", async () => {
    const minted = await mint({
      collection: createErc721V3Collection(e2eErc721V3ContractAddress),
      uri: "ipfs://ipfs/hash",
      creators: [{ account: toEVMAddress(testAddress), value: 10000 }],
      royalties: [],
      lazy: true,
    } as ERC721RequestV3)
    if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
      await minted.transaction.wait()
    }
    await awaitOwnership(await getApis(), e2eErc721V3ContractAddress, minted.tokenId, testAddress)
    const tx = await burn({
      assetType: {
        contract: e2eErc721V3ContractAddress,
        tokenId: minted.tokenId,
      },
      creators: [{ account: toEVMAddress(testAddress), value: 10000 }],
    })
    if (tx) {
      await tx.wait()
    }
    await retry(4, 5000, async () => {
      const apis = await getApis()
      const nftItemResponse = await apis.nftItem.getNftItemById({
        itemId: `${e2eErc721V3ContractAddress}:${minted.tokenId}`,
      })
      expect(nftItemResponse.deleted).toBe(true)
    })
  })

  test.skip("should burn ERC-1155 v2 lazy", async () => {
    const minted = await mint({
      collection: createErc1155V2Collection(e2eErc1155V2ContractAddress),
      uri: "ipfs://ipfs/hash",
      supply: 100,
      creators: [{ account: toEVMAddress(testAddress), value: 10000 }],
      royalties: [],
      lazy: true,
    } as ERC1155RequestV2)
    if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
      await minted.transaction.wait()
    }
    await awaitOwnership(await getApis(), e2eErc1155V2ContractAddress, minted.tokenId, testAddress)
    const tx = await burn({
      assetType: {
        contract: e2eErc1155V2ContractAddress,
        tokenId: minted.tokenId,
      },
      amount: toBigNumber("50"),
      creators: [{ account: toEVMAddress(testAddress), value: 10000 }],
    })
    if (tx) {
      await tx.wait()
    }

    await retry(4, 5000, async () => {
      const apis = await getApis()
      const nftItemResponse = await apis.nftItem.getNftItemById({
        itemId: `${e2eErc1155V2ContractAddress}:${minted.tokenId}`,
      })
      expect(nftItemResponse.deleted).toBe(true)
    })
  })

  test.skip("should burn ERC-1155 v2 lazy and burn creators is empty", async () => {
    const minted = await mint({
      collection: createErc1155V2Collection(e2eErc1155V2ContractAddress),
      uri: "ipfs://ipfs/hash",
      supply: 100,
      creators: [{ account: toEVMAddress(testAddress), value: 10000 }],
      royalties: [],
      lazy: true,
    } as ERC1155RequestV2)
    if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
      await minted.transaction.wait()
    }
    await awaitOwnership(await getApis(), e2eErc1155V2ContractAddress, minted.tokenId, testAddress)
    const tx = await burn({
      assetType: {
        contract: e2eErc1155V2ContractAddress,
        tokenId: minted.tokenId,
      },
      creators: [],
    })
    if (tx) {
      await tx.wait()
    }

    await retry(4, 5000, async () => {
      const apis = await getApis()
      const nftItemResponse = await apis.nftItem.getNftItemById({
        itemId: `${e2eErc1155V2ContractAddress}:${minted.tokenId}`,
      })
      expect(nftItemResponse.deleted).toBe(true)
    })
  })
})
