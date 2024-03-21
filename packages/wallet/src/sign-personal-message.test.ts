// eslint-disable-next-line camelcase
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
import * as fcl from "@onflow/fcl"
import { Web3Ethereum, Web3 } from "@rarible/web3-ethereum"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import { getSolanaMockWallet, solanaTestWords } from "@rarible/solana-common/build/tests/wallets"
import { SolanaKeypairWallet } from "@rarible/solana-wallet"
import { EthereumWallet, FlowWallet, SolanaWallet, TezosWallet } from "./index"

describe("test signPersonalMessage", () => {
	const ethereumE2EProvider = createE2eProvider("d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469")

	test("ethereum signPersonalMessage", async () => {
		const ethereum = new Web3Ethereum({ web3: new Web3(ethereumE2EProvider.provider) })
		const wallet = new EthereumWallet(ethereum)

		const msg = await wallet.signPersonalMessage("Dude, Where Is My Beer?")
		expect(msg.signature).toBe(
			"0x9fa1bffacceceb1cfb8123fd997f121c939a377e73ed2c64bdf0af4a03b" +
      		"a1e91543f3cfda796caa7244d71154c84d87d19cdc469089de6980f0978eca5e3fae21c"
		)
		expect(msg.publicKey).toBe("0xC5eAC3488524D577a1495492599E8013B1F91efa")
	})

	test.skip("flow signPersonalMessage", async () => {
		const wallet = new FlowWallet(fcl)
		await wallet.signPersonalMessage("Dude, Where Is My Beer?")
	})

	test("tezos signPersonalMessage", async () => {
		const provider = in_memory_provider(
			"edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
			"https://hangzhou.tz.functori.com",
		)
		const wallet = new TezosWallet(provider)
		await wallet.signPersonalMessage("Dude, Where Is My Beer?")
	})

	test("solana signPersonalMessage", async () => {
		const walletMock = getSolanaMockWallet(0)
		const testSignature = solanaTestWords[0]
		const wallet = new SolanaWallet(SolanaKeypairWallet.fromKey(walletMock.keys.privateKey))
		const result = await wallet.signPersonalMessage(testSignature)
		expect(result.publicKey).toEqual(walletMock.publicKeyString)
		expect(result.signature).toEqual(walletMock.signatures[testSignature].hexString)
	})
})
