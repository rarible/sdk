import type { Connection, PublicKey } from "@solana/web3.js"
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import type { IWalletSigner } from "@rarible/solana-wallet"

export interface IAccountRevokeDelegateRequest {
	connection: Connection
	signer: IWalletSigner
	tokenAccount: PublicKey
}

export async function getAccountRevokeDelegateInstructions(
	request: IAccountRevokeDelegateRequest,
) {
	const instructions = []
	const signers = [request.signer]

	instructions.push(
		Token.createRevokeInstruction(
			TOKEN_PROGRAM_ID,
			request.tokenAccount,
			request.signer.publicKey,
			[],
		),
	)

	return { instructions, signers }
}