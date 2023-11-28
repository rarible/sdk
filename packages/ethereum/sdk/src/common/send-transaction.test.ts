import Web3 from "web3"
import { Configuration, CollectionControllerApi } from "@rarible/api-client"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress } from "@rarible/types"
import { getApiConfig } from "../config/api-config"
import { getTokenId as getTokenIdTemplate } from "../nft/get-token-id"
import { getErc721Contract } from "../nft/contracts/erc721"
import { ERC721VersionEnum } from "../nft/contracts/domain"
import { checkChainId, WrongNetworkWarning } from "../order/check-chain-id"
import { getEthereumConfig } from "../config"
import type { EthereumNetwork } from "../types"
import { getSendWithInjects } from "./send-transaction"
import { DEV_PK_1 } from "./test/test-credentials"

describe("sendTransaction", () => {
	const { provider, wallet } = createE2eProvider(DEV_PK_1)
	const web3 = new Web3(provider)
	const ethereum = new Web3Ethereum({ web3 })
	const env: EthereumNetwork = "dev-ethereum"
	const configuration = new Configuration(getApiConfig(env))
	const collectionApi = new CollectionControllerApi(configuration)
	const collectionId = toAddress("0x74bddd22a6b9d8fae5b2047af0e0af02c42b7dae")
	const getTokenId = getTokenIdTemplate.bind(null, collectionApi)

	test("throw error if config.chainId is make a difference with chainId of wallet", async () => {
		const testErc721 = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V2, collectionId)
		const config = getEthereumConfig("testnet")
		const checkWalletChainId = checkChainId.bind(null, ethereum, config)

		const send = getSendWithInjects().bind(null, checkWalletChainId)
		const minter = toAddress(wallet.getAddressString())
		const { tokenId, signature: { v, r, s } } = await getTokenId(collectionId, minter)
		const functionCall = testErc721.functionCall("mint", tokenId, v, r, s, [], "uri")
		const tx = send(functionCall)

		await expect(tx).rejects.toThrow(WrongNetworkWarning)
	})
})
