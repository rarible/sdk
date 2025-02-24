import { toEVMAddress } from "@rarible/types"
import { toBn } from "@rarible/utils"
import { getSendWithInjects } from "../common/send-transaction"
import {
  createErc1155V1Collection,
  createErc1155V2Collection,
  createErc721V1Collection,
  createErc721V2Collection,
  createErc721V3Collection,
} from "../common/mint"
import { getEthereumConfig } from "../config"
import { DEV_PK_1, getTestContract } from "../common/test/test-credentials"
import { getApis as getApisTemplate } from "../common/apis"
import { createE2eTestProvider, createEthereumProviders } from "../common/test/create-test-providers"
import { signNft } from "./sign-nft"
import { mint as mintTemplate, MintResponseTypeEnum } from "./mint"
import { ERC1155VersionEnum, ERC721VersionEnum } from "./contracts/domain"
import { getErc721Contract } from "./contracts/erc721"
import { getErc1155Contract } from "./contracts/erc1155"

const { provider, wallet } = createE2eTestProvider(DEV_PK_1)
const { providers } = createEthereumProviders(provider, wallet)

/**
 * @group provider/dev
 */
describe.each(providers)("mint test", ethereum => {
  const env = "dev-ethereum" as const
  const erc721V3ContractAddress = getTestContract(env, "erc721V3")
  const erc1155V2ContractAddress = getTestContract(env, "erc1155V2")

  const minter = toEVMAddress(wallet.getAddressString())
  const config = getEthereumConfig(env)
  const getConfig = async () => config
  const getApis = getApisTemplate.bind(null, ethereum, env)

  const sign = signNft.bind(null, ethereum, getConfig)
  const send = getSendWithInjects()
  const mint = mintTemplate.bind(null, ethereum, send, sign, getApis)

  test.skip("mint ERC-721 v1", async () => {
    const address = toEVMAddress("0x56bcdd5ab16241471765e683ca9593a6cdc42812")
    const contract = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V1, address)
    const startBalanceOfMinter = toBn(await contract.functionCall("balanceOf", minter).call()).toFixed()
    const result = await mint({
      uri: "ipfs://ipfs/hash",
      collection: createErc721V1Collection(address),
    })
    if (result.type === MintResponseTypeEnum.ON_CHAIN) {
      await result.transaction.wait()
    }
    const balanceOfMinter = toBn(await contract.functionCall("balanceOf", minter).call()).toFixed()
    const uri = await contract.functionCall("tokenURI", result.tokenId).call()
    expect(uri).toBe("ipfs://ipfs/hash")
    expect(toBn(balanceOfMinter).minus(startBalanceOfMinter).toString()).toBe("1")
  })

  test.skip("mint ERC-721 v2", async () => {
    const address = toEVMAddress("0x74bddd22a6b9d8fae5b2047af0e0af02c42b7dae")
    const contract = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V2, address)
    const startBalanceOfMinter = toBn(await contract.functionCall("balanceOf", minter).call()).toFixed()
    const result = await mint({
      uri: "ipfs://ipfs/hash",
      royalties: [
        {
          account: minter,
          value: 250,
        },
      ],
      collection: createErc721V2Collection(address),
    })
    if (result.type === MintResponseTypeEnum.ON_CHAIN) {
      await result.transaction.wait()
    }
    const balanceOfMinter = toBn(await contract.functionCall("balanceOf", minter).call()).toFixed()
    const uri = await contract.functionCall("tokenURI", result.tokenId).call()
    expect(uri).toBe("ipfs://ipfs/hash")
    expect(toBn(balanceOfMinter).minus(startBalanceOfMinter).toString()).toBe("1")
  })

  test.skip("use provided nftTokenId", async () => {
    const collection = toEVMAddress("0x74bddd22a6b9d8fae5b2047af0e0af02c42b7dae")
    const apis = await getApis()
    const nftTokenId = await apis.nftCollection.generateNftTokenId({
      collection,
      minter,
    })
    const result = await mint({
      uri: "ipfs://ipfs/hash",
      royalties: [
        {
          account: minter,
          value: 250,
        },
      ],
      collection: createErc721V2Collection(collection),
      nftTokenId,
    })
    if (result.type === MintResponseTypeEnum.ON_CHAIN) {
      await result.transaction.wait()
    }
    expect(result.tokenId).toBe(nftTokenId.tokenId)
  })

  test.skip("mint ERC-1155 v1", async () => {
    const address = toEVMAddress("0x6919dc0cf9d4bcd89727113fbe33e3c24909d6f5")
    const uri = "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5"
    const supply = 101
    const result = await mint({
      collection: createErc1155V1Collection(address),
      uri,
      supply,
      royalties: [
        {
          account: minter,
          value: 250,
        },
      ],
    })
    if (result.type === MintResponseTypeEnum.ON_CHAIN) {
      await result.transaction.wait()
    }
    const contract = await getErc1155Contract(ethereum, ERC1155VersionEnum.ERC1155V1, address)
    const balanceOfMinter = toBn(await contract.functionCall("balanceOf", minter, result.tokenId).call()).toFixed()
    const readUri = await contract.functionCall("uri", result.tokenId).call()
    expect(readUri).toBe(uri)
    expect(balanceOfMinter).toBe(supply.toString())
  })

  test("mint ERC-721 v3", async () => {
    const contract = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V3, erc721V3ContractAddress)
    const startBalanceOfMinter = toBn(await contract.functionCall("balanceOf", minter).call()).toFixed()
    const result = await mint({
      collection: createErc721V3Collection(erc721V3ContractAddress),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      creators: [
        {
          account: toEVMAddress(minter),
          value: 10000,
        },
      ],
      royalties: [],
      lazy: false,
    })
    if (result.type === MintResponseTypeEnum.ON_CHAIN) {
      await result.transaction.wait()
    }
    const finishBalanceOfMinter = toBn(await contract.functionCall("balanceOf", minter).call())
    const uri = await contract.functionCall("tokenURI", result.tokenId).call()
    expect(uri).toBe("ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5")
    expect(finishBalanceOfMinter.minus(startBalanceOfMinter).toString()).toEqual("1")
  })

  test("mint ERC-1155 v2", async () => {
    const minted = await mint({
      collection: createErc1155V2Collection(erc1155V2ContractAddress),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      supply: 100,
      creators: [
        {
          account: toEVMAddress(minter),
          value: 10000,
        },
      ],
      royalties: [],
      lazy: false,
    })
    if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
      await minted.transaction.wait()
    }
    const contract = await getErc1155Contract(ethereum, ERC1155VersionEnum.ERC1155V2, erc1155V2ContractAddress)
    const balanceOfMinter = toBn(await contract.functionCall("balanceOf", minter, minted.tokenId).call()).toFixed()
    const uri = await contract.functionCall("uri", minted.tokenId).call()
    expect(uri).toBe("ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5")
    expect(balanceOfMinter).toEqual("100")
  })

  test("mint ERC-721 v3 lazy", async () => {
    const minted = await mint({
      collection: createErc721V3Collection(erc721V3ContractAddress),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      creators: [
        {
          account: toEVMAddress(minter),
          value: 10000,
        },
      ],
      royalties: [],
      lazy: true,
    })
    if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
      await minted.transaction.wait()
    }
    const apis = await getApis()
    const resultNft = await apis.nftItem.getNftItemById({ itemId: minted.itemId })
    expect(resultNft.lazySupply).toEqual("1")

    const lazy = await apis.nftItem.getNftLazyItemById({ itemId: resultNft.id })
    expect(lazy.uri).toBe("/ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5")
  })

  test("mint ERC-1155 v2 lazy", async () => {
    const minted = await mint({
      collection: createErc1155V2Collection(erc1155V2ContractAddress),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      supply: 100,
      creators: [
        {
          account: toEVMAddress(minter),
          value: 10000,
        },
      ],
      royalties: [],
      lazy: true,
    })
    if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
      await minted.transaction.wait()
    }
    const apis = await getApis()
    const resultNft = await apis.nftItem.getNftItemById({ itemId: minted.itemId })
    expect(resultNft.lazySupply).toEqual("100")

    const lazy = await apis.nftItem.getNftLazyItemById({ itemId: resultNft.id })
    expect(lazy.uri).toBe("/ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5")
  })
})
