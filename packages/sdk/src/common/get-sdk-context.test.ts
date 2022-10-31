import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "../index"

describe("get sdk context", () => {
	const { provider } = createE2eProvider("0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c")

	const web3 = new Web3(provider)
	const ethereum = new Web3Ethereum({ web3: web3 })
	const sdk = createRaribleSdk(new EthereumWallet(ethereum), "development", {
		apiKey: "API_KEY",
	})

	test("get context with goerli wallet", async () => {
		const context = await sdk.getSdkContext()

		expect(context.service).toEqual("union-sdk")
		expect(context.environment).toEqual("development")
		expect(context.sessionId).toBeTruthy()
		expect(context.apiKey).toEqual("API_KEY")
		expect(context["wallet.blockchain"]).toEqual("ETHEREUM")
		expect(context["wallet.address"]).toEqual("0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b")
		expect(context["wallet.chainId"]).toEqual(300500)
	})
})
