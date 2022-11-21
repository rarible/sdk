import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { Configuration, GatewayControllerApi } from "@rarible/ethereum-api-client"
import { getSendWithInjects } from "../common/send-transaction"
import { getApiConfig } from "../config/api-config"
import { getEthereumConfig } from "../config"
import { checkChainId } from "../order/check-chain-id"
import type { EthereumNetwork } from "../types"
import { DEV_PK_1 } from "../common/test/test-credentials"
import { DeployErc721 } from "./deploy-erc721"

describe("deploy erc-721 token test", () => {
	const { provider } = createE2eProvider(DEV_PK_1)
	const web3 = new Web3(provider)
	const ethereum1 = new Web3Ethereum({ web3, gas: 5000000 })

	const env: EthereumNetwork = "dev-ethereum"
	const config = getEthereumConfig(env)
	const configuration = new Configuration(getApiConfig(env))
	const gatewayApi = new GatewayControllerApi(configuration)
	const checkWalletChainId = checkChainId.bind(null, ethereum1, config)
	const send = getSendWithInjects().bind(null, gatewayApi, checkWalletChainId)
	const deployErc721 = new DeployErc721(ethereum1, send, config)


	test("should deploy erc721 token", async () => {
		const { tx, address } = await deployErc721.deployToken(
			"name",
			"RARI",
			"https://ipfs.rarible.com",
			"https://ipfs.rarible.com",
		)
		const createProxyEvent = (await tx.getEvents()).find(e => e.event === "Create721RaribleProxy")

		if (!createProxyEvent || !createProxyEvent.args) {
			throw new Error("Proxy has not been created")
		}
		const proxy = createProxyEvent.args.proxy

		expect(address.toLowerCase()).toBe(proxy.toLowerCase())
	})

	test("should deploy erc721 user token and mint", async () => {
		const { tx, address } = await deployErc721.deployUserToken(
			"name",
			"RARI",
			"https://ipfs.rarible.com",
			"https://ipfs.rarible.com",
			[],
		)
		const createProxyEvent = (await tx.getEvents()).find(e => e.event === "Create721RaribleUserProxy")

		if (!createProxyEvent || !createProxyEvent.args) {
			throw new Error("Proxy has not been created")
		}
		const proxy = createProxyEvent.args.proxy

		expect(address.toLowerCase()).toBe(proxy.toLowerCase())
	})
})
