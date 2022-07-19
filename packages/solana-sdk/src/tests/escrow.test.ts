import { toPublicKey } from "@rarible/solana-common"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { createSdk, genTestWallet, requestSol, retry, TEST_AUCTION_HOUSE } from "./common"

describe("solana sdk escrow", () => {
	const sdk = createSdk()
	const ACCOUNT_DEPOSIT = 0.00089088

	const checkEscrowBalance = async (wallet: IWalletSigner, expected: number | null, withDeposit: boolean = true) => {
		return await retry(5, 2000, async () => {
			const balance = await sdk.auctionHouse.getEscrowBalance({
				wallet: wallet.publicKey,
				signer: wallet,
				auctionHouse: toPublicKey(TEST_AUCTION_HOUSE),
			})
			if (expected !== null) {
				if ((expected + (withDeposit ? ACCOUNT_DEPOSIT : 0)).toString() !== balance.toString()) {
					throw new Error(`wrong balance: ${balance} expected: ${ expected + (withDeposit ? ACCOUNT_DEPOSIT : 0) }`)
				}
				expect(balance.toString()).toEqual((expected + (withDeposit ? ACCOUNT_DEPOSIT : 0)).toString())
			}
			return balance
		})
	}

	const checkWalletBalance = async (wallet: IWalletSigner, expected: number | null, minusDeposit: boolean = true) => {
		const balance = await sdk.balances.getBalance(wallet.publicKey)
		if (expected !== null) {
			expect(parseFloat(balance.toString())).toBeCloseTo(expected - (minusDeposit ? 0.00179372 : 0), 4)
		}
		return balance
	}

	afterEach(async () => {
		//await new Promise((r) => setTimeout(r, 5000))
	})

	const makeBid = async (wallet: IWalletSigner, price: number) => {
		const tx = await (await sdk.order.buy({
			auctionHouse: toPublicKey(TEST_AUCTION_HOUSE),
			signer: wallet,
			price: price,
			tokensAmount: 1,
			mint: toPublicKey("HfaZCCSXMNS3xpPXepCGmPe9AmqQMB1dwP746QUuKSNs"),
		})).submit("max")
		expect(tx.txId).toBeTruthy()
	}

	test("Should check escrow account balance", async () => {
		const buyerWallet = genTestWallet()
		await requestSol(sdk.connection, buyerWallet.publicKey, 0.2)

		await makeBid(buyerWallet, 0.1)
		await checkEscrowBalance(buyerWallet, 0.1)

		await makeBid(buyerWallet, 0.15)
		await checkEscrowBalance(buyerWallet, 0.15)
	})

	test("Should withdraw from escrow account", async () => {
		const buyerWallet = genTestWallet()
		await requestSol(sdk.connection, buyerWallet.publicKey, 0.2)

		await makeBid(buyerWallet, 0.1)
		await checkEscrowBalance(buyerWallet, 0.1)
		await checkWalletBalance(buyerWallet, 0.1, true)

		await (await sdk.auctionHouse.withdrawEscrow({
			amount: 0.08,
			signer: buyerWallet,
			auctionHouse: toPublicKey(TEST_AUCTION_HOUSE),
		})).submit("max")
		await checkEscrowBalance(buyerWallet, 0.02)
		await checkWalletBalance(buyerWallet, 0.18, true)
	})


	test("Should deposit to escrow account", async () => {
		const buyerWallet = genTestWallet()
		await requestSol(sdk.connection, buyerWallet.publicKey, 0.2)

		await makeBid(buyerWallet, 0.01)
		await (await sdk.auctionHouse.depositEscrow({
			amount: 0.1,
			signer: buyerWallet,
			auctionHouse: toPublicKey(TEST_AUCTION_HOUSE),
		})).submit("max")
		await checkEscrowBalance(buyerWallet, 0.11)
	})
})