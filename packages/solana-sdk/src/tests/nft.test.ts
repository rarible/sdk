import { SolanaSdk } from "../sdk/sdk"
import { genTestWallet, getTestWallet, mintToken } from "./common"

describe("solana nft sdk", () => {
	const sdk = SolanaSdk.create({ connection: { cluster: "devnet", commitmentOrConfig: "confirmed" }, debug: true })

	test("Should mint nft & send", async () => {
		const wallet = getTestWallet()

		const { mint, tokenAccount } = await mintToken({ sdk, wallet })

		expect(await sdk.balances.getTokenBalance(wallet.publicKey, mint)).toEqual(1)

		const wallet2 = genTestWallet()

		const transferPrepare = await sdk.nft.transfer({
			signer: wallet,
			mint: mint,
			tokenAccount: tokenAccount.value[0].pubkey,
			to: wallet2.publicKey,
			amount: 1,
		})
		const transferTx = await transferPrepare.submit("max")
		expect(transferTx).toBeTruthy()
		expect(await sdk.balances.getTokenBalance(wallet2.publicKey, mint)).toEqual(1)
		expect(await sdk.balances.getTokenBalance(wallet.publicKey, mint)).toEqual(0)
	})

	test("Should mint nft & burn", async () => {
		const wallet = getTestWallet()

		const { mint, tokenAccount } = await mintToken({ sdk, wallet })

		const burnPrepare = await sdk.nft.burn({
			signer: wallet,
			tokenAccount: tokenAccount.value[0].pubkey,
			mint: mint,
			amount: 1,
		})
		const burnTx = await burnPrepare.submit("finalized")
		expect(burnTx).toBeTruthy()
		expect(await sdk.balances.getTokenBalance(wallet.publicKey, mint)).toEqual(0)
	})
})