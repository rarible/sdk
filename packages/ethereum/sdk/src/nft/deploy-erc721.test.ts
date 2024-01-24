import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import { getSendWithInjects } from "../common/send-transaction"
import { getEthereumConfig } from "../config"
import type { EthereumNetwork } from "../types"
import { DEV_PK_1 } from "../common/test/test-credentials"
import { DeployErc721 } from "./deploy-erc721"

describe("deploy erc-721 token test", () => {
	const { web3Ethereum: ethereum1 } = createE2eProvider(DEV_PK_1)

	const env: EthereumNetwork = "dev-ethereum"
	const config = getEthereumConfig(env)
	const getConfig = async () => config

	const send = getSendWithInjects()
	const deployErc721 = new DeployErc721(ethereum1, send, getConfig)


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
