import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { randomAddress, toAddress } from "@rarible/types"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { checkAssetType as checkAssetTypeTemplate } from "../order/check-asset-type"
import { getSendWithInjects } from "../common/send-transaction"
import { createErc721V3Collection } from "../common/mint"
import { getEthereumConfig } from "../config"
import { getApis as getApisTemplate } from "../common/apis"
import type { EthereumNetwork } from "../types"
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

	const env: EthereumNetwork = "dev-ethereum"
	const config = getEthereumConfig(env)
	const getConfig = async () => config

	const send = getSendWithInjects()
	const getApis = getApisTemplate.bind(null, ethereum, env)
	const checkAssetType = checkAssetTypeTemplate.bind(null, getApis)
	const sign = signNft.bind(null, ethereum, getConfig)

	test("should transfer erc721 lazy token", async () => {
		const from = toAddress(wallet.getAddressString())
		const recipient = randomAddress()
		const contract = toAddress("0x6972347e66A32F40ef3c012615C13cB88Bf681cc")

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
			getApis,
			request
		)

		const asset: TransferAsset = {
			tokenId: minted.tokenId,
			contract: contract,
		}

		const transferTx = await transfer(
			ethereum,
			send,
			checkAssetType,
			getApis,
			asset,
			recipient
		)
		await transferTx.wait()
		const erc721Lazy = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V3, contract)
		const recipientBalance = await erc721Lazy.functionCall("balanceOf", recipient).call()
		expect(recipientBalance).toEqual("1")
	})
})
