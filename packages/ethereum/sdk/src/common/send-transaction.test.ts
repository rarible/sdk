import { Configuration, GatewayControllerApi, NftCollectionControllerApi } from "@rarible/ethereum-api-client"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import type { EthereumContract } from "@rarible/ethereum-provider"
import { toAddress } from "@rarible/types"
import { getApiConfig } from "../config/api-config"
import { getTokenId as getTokenIdTemplate } from "../nft/get-token-id"
import { getErc721Contract } from "../nft/contracts/erc721"
import { ERC721VersionEnum } from "../nft/contracts/domain"
import { checkChainId } from "../order/check-chain-id"
import { getEthereumConfig } from "../config"
import type { EthereumNetwork } from "../types"
import { getSendWithInjects } from "./send-transaction"
import { DEV_PK_1 } from "./test/test-credentials"

describe("sendTransaction", () => {
	const { provider, wallet } = createE2eProvider(DEV_PK_1)
	const web3 = new Web3(provider)
	const ethereum = new Web3Ethereum({ web3 })
	const env: EthereumNetwork = "dev-ethereum"
	const config = getEthereumConfig(env)
	const configuration = new Configuration(getApiConfig(env))
	const gatewayApi = new GatewayControllerApi(configuration)
	const collectionApi = new NftCollectionControllerApi(configuration)
	const checkWalletChainId = checkChainId.bind(null, ethereum, config)

	const send = getSendWithInjects().bind(null, gatewayApi, checkWalletChainId)
	const getTokenId = getTokenIdTemplate.bind(null, collectionApi)

	let testErc721: EthereumContract
	const collectionId = toAddress("0x74bddd22a6b9d8fae5b2047af0e0af02c42b7dae")
	beforeAll(async () => {
		testErc721 = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V2, collectionId)
	})

	test("throw error if config.chainId is make a difference with chainId of wallet", async () => {
		const config = getEthereumConfig("testnet")
		const configuration = new Configuration(getApiConfig("testnet"))
		const gatewayApi = new GatewayControllerApi(configuration)
		const checkWalletChainId = checkChainId.bind(null, ethereum, config)

		const send = getSendWithInjects().bind(null, gatewayApi, checkWalletChainId)

		const minter = toAddress(wallet.getAddressString())
		const { tokenId, signature: { v, r, s } } = await getTokenId(collectionId, minter)
		const functionCall = testErc721.functionCall("mint", tokenId, v, r, s, [], "uri")
		const tx = send(functionCall)

		await expect(tx).rejects.toThrow("Change network of your wallet. Config chainId=5, but wallet chainId=300500")
	})
})
