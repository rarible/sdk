import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import {
	Configuration,
	CollectionControllerApi,
	ItemControllerApi,
	OwnershipControllerApi,
} from "@rarible/api-client"
import { randomAddress, toAddress, toBigNumber } from "@rarible/types"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { checkAssetType as checkAssetTypeTemplate } from "../order/check-asset-type"
import { getSendWithInjects } from "../common/send-transaction"
import { getApiConfig } from "../config/api-config"
import { createErc1155V2Collection } from "../common/mint"
import { checkChainId } from "../order/check-chain-id"
import { getEthereumConfig } from "../config"
import { signNft } from "./sign-nft"
import type { ERC1155RequestV2 } from "./mint"
import { mint, MintResponseTypeEnum } from "./mint"
import type { TransferAsset } from "./transfer"
import { transfer } from "./transfer"
import { ERC1155VersionEnum } from "./contracts/domain"
import { getErc1155Contract } from "./contracts/erc1155"

describe("transfer Erc721 lazy", () => {
	const { provider, wallet } = createE2eProvider("0x26250bb39160076f030517503da31e11aca80060d14f84ebdaced666efb89e21")
	const web3 = new Web3(provider)
	const ethereum = new Web3Ethereum({ web3 })

	const configuration = new Configuration(getApiConfig("dev-ethereum"))
	const nftOwnershipApi = new OwnershipControllerApi(configuration)
	const nftCollectionApi = new CollectionControllerApi(configuration)
	const nftItemApi = new ItemControllerApi(configuration)
	const checkAssetType = checkAssetTypeTemplate.bind(null, nftCollectionApi)
	const sign = signNft.bind(null, ethereum, 300500)
	const config = getEthereumConfig("dev-ethereum")
	const checkWalletChainId = checkChainId.bind(null, ethereum, config)
	const send = getSendWithInjects().bind(null, checkWalletChainId)

	test("should transfer erc1155 lazy token", async () => {
		const recipient = randomAddress()
		const contract = toAddress("0x11F13106845CF424ff5FeE7bAdCbCe6aA0b855c1")

		const request: ERC1155RequestV2 = {
			uri: "ipfs://ipfs/hash",
			creators: [{ account: toAddress(wallet.getAddressString()), value: 10000 }],
			collection: createErc1155V2Collection(contract),
			royalties: [],
			supply: 100,
			lazy: true,
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
		if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
			await minted.transaction.wait()
		}

		const asset: TransferAsset = {
			tokenId: minted.tokenId,
			contract: contract,
		}

		const transferTx = await transfer(
			ethereum,
			send,
			checkAssetType,
			nftItemApi,
			nftOwnershipApi,
			checkWalletChainId,
			asset,
			recipient,
			toBigNumber("50")
		)
		await transferTx.wait()

		const erc1155Lazy = await getErc1155Contract(ethereum, ERC1155VersionEnum.ERC1155V2, contract)
		const recipientBalance = await erc1155Lazy.functionCall("balanceOf", recipient, minted.tokenId).call()
		expect(recipientBalance).toEqual("50")
	})
})
