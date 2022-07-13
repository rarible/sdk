import { createSdk, genTestWallet, getTestWallet, mintToken } from "./common"

describe("solana nft sdk", () => {
	const sdk = createSdk()

	test("Should mint nft & send", async () => {
		const wallet = getTestWallet()

		const { mint } = await mintToken({ sdk, wallet })

		expect((await sdk.balances.getTokenBalance(wallet.publicKey, mint)).toString()).toEqual("1")

		const wallet2 = genTestWallet()

		const transferPrepare = await sdk.nft.transfer({
			signer: wallet,
			mint: mint,
			to: wallet2.publicKey,
			amount: 1,
		})
		const transferTx = await transferPrepare.submit("max")
		expect(transferTx).toBeTruthy()
		await sdk.confirmTransaction(transferTx.txId, "finalized")
		expect((await sdk.balances.getTokenBalance(wallet2.publicKey, mint)).toString()).toEqual("1")
		expect((await sdk.balances.getTokenBalance(wallet.publicKey, mint)).toString()).toEqual("0")
	})

	test("Should mint nft & burn", async () => {
		const wallet = getTestWallet()

		const { mint } = await mintToken({ sdk, wallet })

		const burnPrepare = await sdk.nft.burn({
			signer: wallet,
			mint: mint,
			amount: 1,
		})
		const burnTx = await burnPrepare.submit("finalized")
		expect(burnTx).toBeTruthy()
		await sdk.confirmTransaction(burnTx.txId, "finalized")
		expect((await sdk.balances.getTokenBalance(wallet.publicKey, mint)).toString()).toEqual("0")
	})
})