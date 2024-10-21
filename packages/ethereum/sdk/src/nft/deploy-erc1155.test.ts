import { getSendWithInjects } from "../common/send-transaction"
import { getEthereumConfig } from "../config"
import { DEV_PK_1 } from "../common/test/test-credentials"
import type { EthereumNetwork } from "../types"
import { createE2eTestProvider, createEthereumProviders } from "../common/test/create-test-providers"
import { DeployErc1155 } from "./deploy-erc1155"

const { provider, wallet } = createE2eTestProvider(DEV_PK_1)
const { providers } = createEthereumProviders(provider, wallet)

/**
 * @group provider/dev
 */
describe.each(providers)("deploy token test", ethereum => {
  const env: EthereumNetwork = "dev-ethereum"
  const config = getEthereumConfig(env)
  const getConfig = async () => config

  const send = getSendWithInjects()
  const deployErc1155 = new DeployErc1155(ethereum, send, getConfig)

  test("should deploy erc1155 token", async () => {
    const { tx, address } = await deployErc1155.deployToken("FreeMintable", "TSA", "ipfs:/", "ipfs:/")
    const createProxyEvent = (await tx.getEvents()).find(e => e.event === "Create1155RaribleProxy")

    if (!createProxyEvent || !createProxyEvent.args) {
      throw new Error("Proxy has not been created")
    }

    const proxy = createProxyEvent.args.proxy

    expect(proxy.toLowerCase()).toBe(address.toLowerCase())
  })

  test("should deploy user erc1155 token", async () => {
    const { tx, address } = await deployErc1155.deployUserToken("FreeMintable", "TSA", "ipfs:/", "ipfs:/", [])
    const createProxyEvent = (await tx.getEvents()).find(e => e.event === "Create1155RaribleUserProxy")

    if (!createProxyEvent || !createProxyEvent.args) {
      throw new Error("Proxy has not been created")
    }

    const proxy = createProxyEvent.args.proxy

    expect(address.toLowerCase()).toBe(proxy.toLowerCase())
  })
})
