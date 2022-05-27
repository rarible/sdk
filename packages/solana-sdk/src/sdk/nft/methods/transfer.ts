import type { Connection, PublicKey } from "@solana/web3.js"
import type { u64 } from "@solana/spl-token"
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { Account } from "@metaplex-foundation/mpl-core"
import { createAssociatedTokenAccountInstruction } from "../../../common/helpers"


export interface ITokenTransferRequest {
	connection: Connection
	signer: IWalletSigner
	tokenAccount: PublicKey
	to: PublicKey
	mint: PublicKey
	amount: number | u64
}


export async function getTokenTransferInstructions(
	request: ITokenTransferRequest,
) {
	const instructions = []
	const signers = [request.signer]

	const ata = await Token.getAssociatedTokenAddress(
		ASSOCIATED_TOKEN_PROGRAM_ID,
		TOKEN_PROGRAM_ID,
		request.mint,
		request.to,
	)

	try {
		await Account.load(request.connection, ata)
	} catch {
		instructions.push(
			createAssociatedTokenAccountInstruction(
				ata,
				request.signer.publicKey,
				request.to,
				request.mint,
			),
		)
	}

	instructions.push(
		Token.createTransferInstruction(
			TOKEN_PROGRAM_ID,
			request.tokenAccount,
			ata,
			request.signer.publicKey,
			[],
			request.amount,
		),
	)

	return { instructions, signers }
}