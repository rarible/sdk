import type { Connection, PublicKey } from "@solana/web3.js"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { SolanaKeypairWallet } from "@rarible/solana-wallet"
import { BN } from "@project-serum/anchor"
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { AuctionHouseProgram } from "@metaplex-foundation/mpl-auction-house"
import type { ITransactionPreparedInstructions } from "../../../common/transactions"
import { WRAPPED_SOL_MINT } from "../../../common/contracts"
import { getMetadata } from "../../../common/helpers"
import {
	getAssociatedTokenAccountForMint,
	getAuctionHouseBuyerEscrow,
	getAuctionHouseTradeState,
	getPriceWithMantissa,
	loadAuctionHouseProgram,
} from "./helpers"

export interface IActionHouseBuyRequest {
	connection: Connection
	auctionHouse: PublicKey
	signer: IWalletSigner
	mint: PublicKey
	tokenAccount?: PublicKey
	price: number
	// tokens amount to purchase
	tokensAmount: number
}


export async function getActionHouseBuyInstructions(
	request: IActionHouseBuyRequest
): Promise<ITransactionPreparedInstructions> {
	const walletKeyPair = request.signer

	const anchorProgram = await loadAuctionHouseProgram(request.connection, request.signer)
	const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(request.auctionHouse)

	const buyPriceAdjusted = new BN(
		await getPriceWithMantissa(
			request.price,
			auctionHouseObj.treasuryMint,
			walletKeyPair,
			anchorProgram,
		),
	)

	const tokenSizeAdjusted = new BN(
		await getPriceWithMantissa(
			request.tokensAmount,
			request.mint,
			walletKeyPair,
			anchorProgram,
		),
	)

	const [escrowPaymentAccount, escrowBump] = await getAuctionHouseBuyerEscrow(
		request.auctionHouse,
		walletKeyPair.publicKey,
	)

	let tokenAccountKey
	if (request.tokenAccount) {
		tokenAccountKey = request.tokenAccount
	} else {
		const tla = await anchorProgram.provider.connection.getTokenLargestAccounts(request.mint)
		tokenAccountKey = tla.value[0].address
	}

	const [tradeState, tradeBump] = await getAuctionHouseTradeState(
		request.auctionHouse,
		walletKeyPair.publicKey,
		tokenAccountKey,
		auctionHouseObj.treasuryMint,
		request.mint,
		tokenSizeAdjusted,
		buyPriceAdjusted,
	)

	const isNative = auctionHouseObj.treasuryMint.equals(WRAPPED_SOL_MINT)

	const ata = (
		await getAssociatedTokenAccountForMint(
			auctionHouseObj.treasuryMint,
			walletKeyPair.publicKey,
		)
	)[0]
	const transferAuthority = SolanaKeypairWallet.generate()
	const signers: IWalletSigner[] = isNative ? [] : [transferAuthority]

	const instruction = AuctionHouseProgram.instructions.createBuyInstruction({
		wallet: request.signer.publicKey,
		paymentAccount: isNative ? walletKeyPair.publicKey : ata,
		transferAuthority: isNative ? walletKeyPair.publicKey : transferAuthority.publicKey,
		treasuryMint: auctionHouseObj.treasuryMint,
		tokenAccount: tokenAccountKey,
		metadata: await getMetadata(request.mint),
		escrowPaymentAccount: escrowPaymentAccount,
		authority: auctionHouseObj.authority,
		auctionHouse: request.auctionHouse,
		auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
		buyerTradeState: tradeState,
	}, {
		tradeStateBump: tradeBump,
		escrowPaymentBump: escrowBump,
		buyerPrice: buyPriceAdjusted,
		tokenSize: tokenSizeAdjusted,
	})

	if (!isNative) {
		instruction.keys
			.filter(k => k.pubkey.equals(transferAuthority.publicKey))
			.map(k => (k.isSigner = true))
	}

	const instructions = [
		...(isNative
			? []
			: [
				Token.createApproveInstruction(
					TOKEN_PROGRAM_ID,
					ata,
					transferAuthority.publicKey,
					walletKeyPair.publicKey,
					[],
					buyPriceAdjusted.toNumber(),
				),
			]),

		instruction,
		...(isNative
			? []
			: [
				Token.createRevokeInstruction(
					TOKEN_PROGRAM_ID,
					ata,
					walletKeyPair.publicKey,
					[],
				),
			]),
	]

	return { instructions, signers }
}