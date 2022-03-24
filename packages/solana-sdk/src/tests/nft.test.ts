import { SolanaSdk } from "../sdk/sdk"
import { checkTokenBalance, genTestWallet, getTestWallet, mint } from "./common"

describe("solana nft sdk", () => {
	const sdk = SolanaSdk.create({ connection: { cluster: "devnet" }, debug: true })

	test("Should mint nft & send", async () => {
		const wallet = getTestWallet()

		const { mintTx, balance } = await mint({ sdk, wallet })

		const wallet2 = genTestWallet()

		const transferTx = await sdk.nft.transfer({
			signer: wallet,
			mint: mintTx.mint,
			tokenAccount: balance.value[0].pubkey,
			to: wallet2.publicKey,
			amount: 1,
		})

		expect(transferTx.txId).toBeTruthy()
		await sdk.connection.confirmTransaction(transferTx.txId, "finalized")
		await checkTokenBalance(sdk.connection, wallet2.publicKey, mintTx.mint, 1)
	})

	test("Should mint nft & burn", async () => {
		const wallet = getTestWallet()

		const { mintTx, balance } = await mint({ sdk, wallet })

		await sdk.nft.burn({
			signer: wallet,
			tokenAccount: balance.value[0].pubkey,
			mint: mintTx.mint,
			amount: 1,
		})
		await sdk.connection.confirmTransaction(mintTx.txId, "finalized")
		await checkTokenBalance(sdk.connection, wallet.publicKey, mintTx.mint, 0)
	})
})