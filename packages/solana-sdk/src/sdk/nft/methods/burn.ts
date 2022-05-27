import type { Connection, PublicKey } from "@solana/web3.js"
import type { u64 } from "@solana/spl-token"
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import type { IWalletSigner } from "@rarible/solana-wallet"

export interface ITokenBurnRequest {
	connection: Connection
	signer: IWalletSigner
	tokenAccount: PublicKey
	mint: PublicKey
	amount: number | u64
	owner?: PublicKey // owner authority for tokenAccount
	close?: boolean // close the token account after burning the token
}

export async function getTokenBurnInstructions(
	request: ITokenBurnRequest,
) {
	const instructions = []
	const signers = [request.signer]

	instructions.push(
		Token.createBurnInstruction(
			TOKEN_PROGRAM_ID,
			request.mint,
			request.tokenAccount,
			request.owner ?? request.signer.publicKey,
			[],
			request.amount,
		),
	)

	if (request.close) {
		instructions.push(
			Token.createCloseAccountInstruction(
				TOKEN_PROGRAM_ID,
				request.tokenAccount,
				request.signer.publicKey,
				request.owner ?? request.signer.publicKey,
				[],
			),
		)
	}

	return { instructions, signers }
}