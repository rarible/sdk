import BigNumber from "bignumber.js"
import type { BigNumberValue } from "@rarible/utils"
import type { Connection, PublicKey } from "@solana/web3.js"
import * as web3 from "@solana/web3.js"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { SolanaKeypairWallet } from "@rarible/solana-wallet"
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import type { ITransactionPreparedInstructions } from "../../../common/transactions"
import { WRAPPED_SOL_MINT } from "../../../common/contracts"
import { getAssociatedTokenAccountForMint, getPriceWithMantissa } from "../../../common/helpers"
import { getAuctionHouseBuyerEscrow, loadAuctionHouseProgram } from "../../../common/auction-house-helpers"
import { bigNumToBn } from "../../../common/utils"

export interface IActionHouseEscrowDepositRequest {
	connection: Connection
	auctionHouse: PublicKey
	signer: IWalletSigner
	amount: BigNumberValue
}


export async function getActionHouseEscrowDepositInstructions(
	request: IActionHouseEscrowDepositRequest,
): Promise<ITransactionPreparedInstructions> {
	const walletKeyPair = request.signer

	const anchorProgram = await loadAuctionHouseProgram(request.connection, request.signer)
	const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(request.auctionHouse)

	const amountAdjusted = bigNumToBn(await getPriceWithMantissa(
		request.connection,
		new BigNumber(request.amount),
		auctionHouseObj.treasuryMint,
		walletKeyPair,
	))

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

	const transferAuthority = SolanaKeypairWallet.generate()
	const signers = isNative ? [] : [transferAuthority]

	const instruction = await anchorProgram.instruction.deposit(
		escrowBump,
		amountAdjusted,
		{
			accounts: {
				wallet: walletKeyPair.publicKey,
				paymentAccount: isNative ? walletKeyPair.publicKey : ata,
				transferAuthority: isNative
					? web3.SystemProgram.programId
					: transferAuthority.publicKey,
				escrowPaymentAccount,
				//@ts-ignore
				treasuryMint: auctionHouseObj.treasuryMint,
				//@ts-ignore
				authority: auctionHouseObj.authority,
				auctionHouse: request.auctionHouse,
				//@ts-ignore
				auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: web3.SystemProgram.programId,
				rent: web3.SYSVAR_RENT_PUBKEY,
			},
		},
	)

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
					amountAdjusted,
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