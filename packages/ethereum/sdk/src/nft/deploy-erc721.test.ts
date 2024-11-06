import { getSendWithInjects } from "../common/send-transaction"
import { getEthereumConfig } from "../config"
import type { EthereumNetwork } from "../types"
import { DEV_PK_1 } from "../common/test/test-credentials"
import { createE2eTestProvider, createEthereumProviders } from "../common/test/create-test-providers"
import { DeployErc721 } from "./deploy-erc721"

const { provider, wallet } = createE2eTestProvider(DEV_PK_1)
const { providers } = createEthereumProviders(provider, wallet)

/**
 * @group provider/dev
 */
describe.each(providers)("deploy erc-721 token test", ethereum => {
  const env: EthereumNetwork = "dev-ethereum"
  const config = getEthereumConfig(env)
  const getConfig = async () => config

  const send = getSendWithInjects()
  const deployErc721 = new DeployErc721(ethereum, send, getConfig)

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
