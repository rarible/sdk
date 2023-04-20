import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import { toAddress } from "@rarible/types"
import type { Address } from "@rarible/ethereum-api-client"
import {
	Configuration,
	GatewayControllerApi,
	NftCollectionControllerApi,
	NftItemControllerApi,
	NftLazyMintControllerApi,
} from "@rarible/ethereum-api-client"
import { BigNumber, toBn } from "@rarible/utils"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { ethers } from "ethers"
import { EthersEthereum, EthersWeb3ProviderEthereum } from "@rarible/ethers-ethereum"
import Web3 from "web3"
import { getSendWithInjects } from "../common/send-transaction"
import { getApiConfig } from "../config/api-config"
import type {
	ERC1155RequestV1, ERC1155RequestV2,
	ERC721RequestV1, ERC721RequestV2, ERC721RequestV3,
} from "../common/mint"
import {
	createErc1155V1Collection,
	createErc1155V2Collection,
	createErc721V1Collection,
	createErc721V2Collection,
	createErc721V3Collection, MintResponseTypeEnum,
} from "../common/mint"
import { checkChainId } from "../order/check-chain-id"
import { getEthereumConfig } from "../config"
import { DEV_PK_1 } from "../common/test/test-credentials"
import type { EthereumNetwork } from "../types"
import { signNft } from "./sign-nft"
import { mint as mintTemplate } from "./mint"
import { ERC1155VersionEnum, ERC721VersionEnum } from "./contracts/domain"
import { getErc721Contract } from "./contracts/erc721"
import { getErc1155Contract } from "./contracts/erc1155"

const pk = DEV_PK_1
const { provider: provider1 } = createE2eProvider(pk)
const { provider: provider2, wallet: wallet2 } = createE2eProvider(pk)
const { provider: provider3 } = createE2eProvider(pk)
const web3 = new Web3(provider1 as any)

const providers = [
	new Web3Ethereum({ web3 }),
	new EthersEthereum(
		new ethers.Wallet(wallet2.getPrivateKeyString(), new ethers.providers.Web3Provider(provider2 as any)),
	),
	new EthersWeb3ProviderEthereum(new ethers.providers.Web3Provider(provider3 as any)),
]

const env: EthereumNetwork = "dev-ethereum"
const configuration = new Configuration(getApiConfig(env))
const nftCollectionApi = new NftCollectionControllerApi(configuration)
const nftLazyMintApi = new NftLazyMintControllerApi(configuration)
const nftItemApi = new NftItemControllerApi(configuration)
const gatewayApi = new GatewayControllerApi(configuration)

const erc721V3ContractAddress = toAddress("0x6972347e66A32F40ef3c012615C13cB88Bf681cc")
const erc1155V2ContractAddress = toAddress("0x11F13106845CF424ff5FeE7bAdCbCe6aA0b855c1")

describe.each(providers)("mint test", ethereum => {
	let minter: Address
	const config = getEthereumConfig(env)
	const checkWalletChainId = checkChainId.bind(null, ethereum, config)

	beforeAll(async () => {
		minter = toAddress(await ethereum.getFrom())
	})

	const sign = signNft.bind(null, ethereum, config.chainId)

	const send = getSendWithInjects().bind(null, gatewayApi, checkWalletChainId)

	const mint = mintTemplate
		.bind(null, ethereum, send, sign, nftCollectionApi)
		.bind(null, nftLazyMintApi, checkWalletChainId)

	test("mint ERC-721 v1", async () => {
		const address = toAddress("0x56bcdd5ab16241471765e683ca9593a6cdc42812")
		const contract = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V1, address)
		const startBalanceOfMinter = toBn(await contract.functionCall("balanceOf", minter).call()).toFixed()
		const result = await mint({
			uri: "ipfs://ipfs/hash",
			collection: createErc721V1Collection(address),
		} as ERC721RequestV1)
		if (result.type === MintResponseTypeEnum.ON_CHAIN) {
			await result.transaction.wait()
		}
		const balanceOfMinter = toBn(await contract.functionCall("balanceOf", minter).call()).toFixed()
		const uri = await contract.functionCall("tokenURI", result.tokenId).call()
		expect(uri).toBe("ipfs://ipfs/hash")
		expect(new BigNumber(balanceOfMinter).minus(startBalanceOfMinter).toString()).toBe("1")
	})

	test("mint ERC-721 v2", async () => {
		const address = toAddress("0x74bddd22a6b9d8fae5b2047af0e0af02c42b7dae")
		const contract = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V2, address)
		const startBalanceOfMinter = toBn(await contract.functionCall("balanceOf", minter).call()).toFixed()
		const result = await mint({
			uri: "ipfs://ipfs/hash",
			royalties: [{
				account: minter,
				value: 250,
			}],
			collection: createErc721V2Collection(address),
		} as ERC721RequestV2)
		if (result.type === MintResponseTypeEnum.ON_CHAIN) {
			await result.transaction.wait()
		}
		const balanceOfMinter = toBn(await contract.functionCall("balanceOf", minter).call()).toFixed()
		const uri = await contract.functionCall("tokenURI", result.tokenId).call()
		expect(uri).toBe("ipfs://ipfs/hash")
		expect(new BigNumber(balanceOfMinter).minus(startBalanceOfMinter).toString()).toBe("1")
	})

	test("use provided nftTokenId", async () => {
		const collection = toAddress("0x74bddd22a6b9d8fae5b2047af0e0af02c42b7dae")
		const nftTokenId = await nftCollectionApi.generateNftTokenId({ collection, minter })
		const result = await mint({
			uri: "ipfs://ipfs/hash",
			royalties: [{
				account: minter,
				value: 250,
			}],
			collection: createErc721V2Collection(collection),
			nftTokenId,
		} as ERC721RequestV2)
		if (result.type === MintResponseTypeEnum.ON_CHAIN) {
			await result.transaction.wait()
		}
		expect(result.tokenId).toBe(nftTokenId.tokenId)
	})

	test("mint ERC-1155 v1", async () => {
		const address = toAddress("0x6919dc0cf9d4bcd89727113fbe33e3c24909d6f5")
		const uri = "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5"
		const supply = 101
		const result = await mint({
			collection: createErc1155V1Collection(address),
			uri,
			supply,
			royalties: [{
				account: minter,
				value: 250,
			}],
		} as ERC1155RequestV1)
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
			creators: [{ account: toAddress(minter), value: 10000 }],
			royalties: [],
			lazy: false,
		} as ERC721RequestV3)
		if (result.type === MintResponseTypeEnum.ON_CHAIN) {
			await result.transaction.wait()
		}
		const finishBalanceOfMinter = toBn(await contract.functionCall("balanceOf", minter).call()).toFixed()
		const uri = await contract.functionCall("tokenURI", result.tokenId).call()
		expect(uri).toBe("ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5")
		expect(new BigNumber(finishBalanceOfMinter).minus(startBalanceOfMinter).toString()).toEqual("1")
	})

	test("mint ERC-1155 v2", async () => {
		const minted = await mint({
			collection: createErc1155V2Collection(erc1155V2ContractAddress),
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			supply: 100,
			creators: [{ account: toAddress(minter), value: 10000 }],
			royalties: [],
			lazy: false,
		} as ERC1155RequestV2)
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
			creators: [{ account: toAddress(minter), value: 10000 }],
			royalties: [],
			lazy: true,
		} as ERC721RequestV3)
		if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
			await minted.transaction.wait()
		}
		const resultNft = await nftItemApi.getNftItemById({ itemId: minted.itemId })
		expect(resultNft.lazySupply).toEqual("1")

		const lazy = await nftItemApi.getNftLazyItemById({ itemId: resultNft.id })
		expect(lazy.uri).toBe("/ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5")
	})

	test("mint ERC-1155 v2 lazy", async () => {
		const minted = await mint({
			collection: createErc1155V2Collection(erc1155V2ContractAddress),
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			supply: 100,
			creators: [{ account: toAddress(minter), value: 10000 }],
			royalties: [],
			lazy: true,
		} as ERC1155RequestV2)
		if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
			await minted.transaction.wait()
		}
		const resultNft = await nftItemApi.getNftItemById({ itemId: minted.itemId })
		expect(resultNft.lazySupply).toEqual("100")

		const lazy = await nftItemApi.getNftLazyItemById({ itemId: resultNft.id })
		expect(lazy.uri).toBe("/ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5")
	})
})
