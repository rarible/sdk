import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import {
	Configuration,
	CollectionControllerApi,
	ItemControllerApi,
	OwnershipControllerApi,
} from "@rarible/api-client"
import { randomAddress, toContractAddress } from "@rarible/types"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { checkAssetType as checkAssetTypeTemplate } from "../order/check-asset-type"
import { getSendWithInjects } from "../common/send-transaction"
import { getApiConfig } from "../config/api-config"
import { createErc721V3Collection } from "../common/mint"
import { checkChainId } from "../order/check-chain-id"
import { getEthereumConfig } from "../config"
import { getEthUnionAddr } from "../common/test"
import { signNft } from "./sign-nft"
import type { ERC721RequestV3 } from "./mint"
import { mint } from "./mint"
import type { TransferAsset } from "./transfer"
import { transfer } from "./transfer"
import { ERC721VersionEnum } from "./contracts/domain"
import { getErc721Contract } from "./contracts/erc721"

describe("transfer Erc721 lazy", () => {
	const { provider, wallet } = createE2eProvider("0x26250bb39160076f030517503da31e11aca80060d14f84ebdaced666efb89e21")
	const web3 = new Web3(provider)
	const ethereum = new Web3Ethereum({ web3 })

	const configuration = new Configuration(getApiConfig("dev-ethereum"))
	const nftOwnershipApi = new OwnershipControllerApi(configuration)
	const nftCollectionApi = new CollectionControllerApi(configuration)
	const nftItemApi = new ItemControllerApi(configuration)
	const config = getEthereumConfig("dev-ethereum")
	const checkWalletChainId = checkChainId.bind(null, ethereum, config)
	const send = getSendWithInjects().bind(null, checkWalletChainId)
	const checkAssetType = checkAssetTypeTemplate.bind(null, nftCollectionApi)
	const sign = signNft.bind(null, ethereum, 300500)

	test("should transfer erc721 lazy token", async () => {
		const from = getEthUnionAddr(wallet.getAddressString())
		const recipient = getEthUnionAddr(randomAddress())
		const contract = getEthUnionAddr("0x6972347e66A32F40ef3c012615C13cB88Bf681cc")

		const request: ERC721RequestV3 = {
			uri: "ipfs://ipfs/hash",
			creators: [{ account: from, value: 10000 }],
			royalties: [],
			lazy: true,
			collection: createErc721V3Collection(contract),
		}

		const minted = await mint(
			ethereum,
			send,
			sign,
			nftCollectionApi,
			nftItemApi,
			checkWalletChainId,
			request
		)

		const asset: TransferAsset = {
			tokenId: minted.tokenId,
			contract: toContractAddress(contract),
		}

		const transferTx = await transfer(
			ethereum,
			send,
			config,
			checkAssetType,
			nftItemApi,
			nftOwnershipApi,
			checkWalletChainId,
			asset,
			recipient
		)
		await transferTx.wait()
		const erc721Lazy = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V3, contract)
		const recipientBalance = await erc721Lazy.functionCall("balanceOf", recipient).call()
		expect(recipientBalance).toEqual("1")
	})
})
