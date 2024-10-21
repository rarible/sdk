import { EthereumWallet } from "@rarible/sdk-wallet"
import { createE2eTestProvider } from "../sdk-blockchains/ethereum/test/init-providers"
import { createSdk } from "./test/create-sdk"

describe("get sdk context", () => {
  const { web3v4Ethereum } = createE2eTestProvider("0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c")

  const sdk = createSdk(new EthereumWallet(web3v4Ethereum), "development", {
    apiKey: "API_KEY",
    context: { providerId: "WalletConnect", providerMeta: { connectorName: "metamask" } },
  })

  test("get context with goerli wallet", async () => {
    const context = await sdk.getSdkContext()

    expect(context.service).toEqual("union-sdk")
    expect(context.environment).toEqual("development")
    expect(context.sessionId).toBeTruthy()
    expect(context.apiKey).toEqual("API_KEY")
    expect(context.providerId).toEqual("WalletConnect")
    expect(context.providerMeta).toEqual('{"connectorName":"metamask"}')
    expect(context["wallet.blockchain"]).toEqual("ETHEREUM")
    expect(context["wallet.address"]).toEqual("0x22d491bde2303f2f43325b2108d26f1eaba1e32b")
    expect(context["wallet.chainId"]).toEqual(300500)
  })
})
