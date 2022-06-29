import type { Connection, PublicKey } from "@solana/web3.js"
import { TransactionInstruction } from "@solana/web3.js"
import type { BN } from "@project-serum/anchor"
import { serialize } from "borsh"
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import type { BigNumberValue } from "@rarible/utils"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { Account } from "@metaplex-foundation/mpl-core"
import { createAssociatedTokenAccountInstruction } from "../../../common/helpers"
import { alignBn, bigNumToBn, bnToBuffer } from "../../../common/utils"

export interface ITokenTransferRequest {
	connection: Connection
	signer: IWalletSigner
	tokenAccount: PublicKey
	to: PublicKey
	mint: PublicKey
	amount: BigNumberValue
}

export async function getTokenTransferInstructions(
	request: ITokenTransferRequest,
) {
	const instructions = []
	const signers = [request.signer]

	const destinationTokenAccount = await Token.getAssociatedTokenAddress(
		ASSOCIATED_TOKEN_PROGRAM_ID,
		TOKEN_PROGRAM_ID,
		request.mint,
		request.to,
	)

	try {
		await Account.load(request.connection, destinationTokenAccount)
	} catch {
		instructions.push(
			createAssociatedTokenAccountInstruction(
				destinationTokenAccount,
				request.signer.publicKey,
				request.to,
				request.mint,
			),
		)
	}

	instructions.push(
		createTransferTokenInstruction(
			request.tokenAccount,
			destinationTokenAccount,
			request.signer.publicKey,
			alignBn(bigNumToBn(request.amount), 8),
		),
	)

	return { instructions, signers }
}


export function createTransferTokenInstruction(
	sourceTokenAccount: PublicKey,
	destinationTokenAccount: PublicKey,
	owner: PublicKey,
	amount: BN
) {
	const data = Buffer.from(serialize(new Map<any, any>([[
		Object,
		{
			kind: "struct",
			fields: [
				["instruction", "u8"],
				["amount", "u64"],
			],
		},
	]]), {
		instruction: 3,
		amount: bnToBuffer(amount, "le", 8),
	}))

	const keys = [{
		pubkey: sourceTokenAccount,
		isSigner: false,
		isWritable: true,
	}, {
		pubkey: destinationTokenAccount,
		isSigner: false,
		isWritable: true,
	}]

	keys.push({
		pubkey: owner,
		isSigner: true,
		isWritable: false,
	})

	return new TransactionInstruction({
		programId: TOKEN_PROGRAM_ID,
		keys,
		data,
	})
}