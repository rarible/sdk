import { toAddress, toBigNumber } from "@rarible/types"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import {
	Configuration,
	GatewayControllerApi,
	NftCollectionControllerApi,
	NftLazyMintControllerApi,
} from "@rarible/ethereum-api-client"
import { retry } from "../common/retry"
import type { ERC721RequestV3 } from "../nft/mint"
import { mint, MintResponseTypeEnum } from "../nft/mint"
import { signNft } from "../nft/sign-nft"
import { getSendWithInjects } from "../common/send-transaction"
import { createErc721V3Collection } from "../common/mint"
import { getApiConfig } from "../config/api-config"
import { createTestProviders } from "../common/create-test-providers"
import { getEthereumConfig } from "../config"
import type { EthereumNetwork } from "../types"
import { DEV_PK_1 } from "../common/test/test-credentials"
import { checkAssetType as checkAssetTypeTemplate } from "./check-asset-type"
import { checkChainId } from "./check-chain-id"

const { provider, wallet } = createE2eProvider(DEV_PK_1)
const { providers } = createTestProviders(provider, wallet)
const from = toAddress(wallet.getAddressString())

describe.each(providers)("check-asset-type test", ethereum => {
	const env: EthereumNetwork = "dev-ethereum"
	const e2eErc721ContractAddress = toAddress("0x6972347e66A32F40ef3c012615C13cB88Bf681cc")
	const configuration = new Configuration(getApiConfig(env))
	const nftCollectionApi = new NftCollectionControllerApi(configuration)
	const nftLazyMintApi = new NftLazyMintControllerApi(configuration)
	const gatewayApi = new GatewayControllerApi(configuration)
	const sign = signNft.bind(null, ethereum, 300500)
	const config = getEthereumConfig(env)
	const checkWalletChainId = checkChainId.bind(null, ethereum, config)
	const send = getSendWithInjects().bind(null, gatewayApi, checkWalletChainId)
	const checkAssetType = checkAssetTypeTemplate.bind(null, nftCollectionApi)

	test("should set assetClass if type not present", async () => {
		const request: ERC721RequestV3 = {
			uri: "ipfs://ipfs/hash",
			lazy: false,
			creators: [{ account: from, value: 10000 }],
			royalties: [],
			collection: createErc721V3Collection(e2eErc721ContractAddress),
		}
		const minted = await mint(
			ethereum,
			send,
			sign,
			nftCollectionApi,
			nftLazyMintApi,
			checkWalletChainId,
			request
		)
		if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
			await minted.transaction.wait()
		}

		const assetClass = await retry(10, 4000, async () => {
			const assetType = await checkAssetType({
				contract: e2eErc721ContractAddress,
				tokenId: toBigNumber(minted.tokenId),
			})
			if (assetType.assetClass !== "ERC721") {
				throw new Error("Asset type must be ERC721")
			}
			return assetType.assetClass
		})
		expect(assetClass).toEqual("ERC721")
	})

	test("should leave as is if assetClass present", async () => {
		const request: ERC721RequestV3 = {
			uri: "ipfs://ipfs/hash",
			creators: [{ account: from, value: 10000 }],
			royalties: [],
			lazy: false,
			collection: createErc721V3Collection(e2eErc721ContractAddress),
		}
		const minted = await mint(
			ethereum,
			send,
			sign,
			nftCollectionApi,
			nftLazyMintApi,
			checkWalletChainId,
			request
		)
		if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
			await minted.transaction.wait()
		}

		const assetType = await checkAssetType({
			assetClass: "ERC721",
			contract: e2eErc721ContractAddress,
			tokenId: toBigNumber(minted.tokenId),
		})
		expect(assetType.assetClass).toEqual("ERC721")
	})
})
