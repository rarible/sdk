import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { Configuration, GatewayControllerApi } from "@rarible/ethereum-api-client"
import { getSendWithInjects } from "../common/send-transaction"
import { getApiConfig } from "../config/api-config"
import { getEthereumConfig } from "../config"
import { checkChainId } from "../order/check-chain-id"
import { DEV_PK_1 } from "../common/test/test-credentials"
import type { EthereumNetwork } from "../types"
import { DeployErc1155 } from "./deploy-erc1155"

describe("deploy token test", () => {
	const { provider } = createE2eProvider(DEV_PK_1)
	const web3 = new Web3(provider as any)
	const ethereum1 = new Web3Ethereum({ web3 })

	const env: EthereumNetwork = "dev-ethereum"
	const config = getEthereumConfig(env)
	const configuration = new Configuration(getApiConfig(env))
	const gatewayApi = new GatewayControllerApi(configuration)
	const checkWalletChainId = checkChainId.bind(null, ethereum1, config)
	const send = getSendWithInjects().bind(null, gatewayApi, checkWalletChainId)
	const deployErc1155 = new DeployErc1155(ethereum1, send, config)


	test("should deploy erc1155 token", async () => {
		const { tx, address } = await deployErc1155.deployToken(
			"FreeMintable",
			"TSA",
			"ipfs:/",
			"ipfs:/",
		)
		const createProxyEvent = (await tx.getEvents()).find(e => e.event === "Create1155RaribleProxy")

		if (!createProxyEvent || !createProxyEvent.args) {
			throw new Error("Proxy has not been created")
		}

		const proxy = createProxyEvent.args.proxy

		expect(proxy.toLowerCase()).toBe(address.toLowerCase())
	})

	test("should deploy user erc1155 token", async () => {
		const { tx, address } = await deployErc1155.deployUserToken(
			"FreeMintable",
			"TSA",
			"ipfs:/",
			"ipfs:/",
			[],
		)
		const createProxyEvent = (await tx.getEvents()).find(e => e.event === "Create1155RaribleUserProxy")

		if (!createProxyEvent || !createProxyEvent.args) {
			throw new Error("Proxy has not been created")
		}

		const proxy = createProxyEvent.args.proxy

		expect(address.toLowerCase()).toBe(proxy.toLowerCase())
	})

})
