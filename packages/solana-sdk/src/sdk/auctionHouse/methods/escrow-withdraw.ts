import type { Connection, PublicKey } from "@solana/web3.js"
import * as web3 from "@solana/web3.js"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { BN } from "@project-serum/anchor"
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import type { ITransactionPreparedInstructions } from "../../../common/transactions"
import { WRAPPED_SOL_MINT } from "../../../common/contracts"
import { getAssociatedTokenAccountForMint, getPriceWithMantissa, getTokenAmount } from "../../../common/helpers"
import { getAuctionHouseBuyerEscrow, loadAuctionHouseProgram } from "../../../common/auction-house-helpers"

export interface IActionHouseEscrowWithdrawRequest {
	connection: Connection
	auctionHouse: PublicKey
	signer: IWalletSigner
	amount: number
}


export async function getActionHouseEscrowWithdrawInstructions(
	request: IActionHouseEscrowWithdrawRequest,
): Promise<ITransactionPreparedInstructions> {
	const walletKeyPair = request.signer

	const anchorProgram = await loadAuctionHouseProgram(request.connection, request.signer)
	const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(request.auctionHouse)

	const amountAdjusted = await getPriceWithMantissa(
		request.amount,
		auctionHouseObj.treasuryMint,
		walletKeyPair,
		anchorProgram,
	)

	const [escrowPaymentAccount, escrowBump] = await getAuctionHouseBuyerEscrow(
		request.auctionHouse,
		walletKeyPair.publicKey,
	)

	const isNative = auctionHouseObj.treasuryMint.equals(WRAPPED_SOL_MINT)
	const ata = (
		await getAssociatedTokenAccountForMint(
			auctionHouseObj.treasuryMint,
			walletKeyPair.publicKey,
		)
	)[0]

	const signers: any[] = []
	const instruction = await anchorProgram.instruction.withdraw(
		escrowBump,
		new BN(amountAdjusted),
		{
			accounts: {
				wallet: walletKeyPair.publicKey,
				receiptAccount: isNative ? walletKeyPair.publicKey : ata,
				escrowPaymentAccount,
				treasuryMint: auctionHouseObj.treasuryMint,
				authority: auctionHouseObj.authority,
				auctionHouse: request.auctionHouse,
				auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: web3.SystemProgram.programId,
				rent: web3.SYSVAR_RENT_PUBKEY,
				ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
			},
			signers,
		},
	)

	instruction.keys
		.filter(k => k.pubkey.equals(walletKeyPair.publicKey))
		.map(k => (k.isSigner = true))

	return { instructions: [instruction], signers }
}