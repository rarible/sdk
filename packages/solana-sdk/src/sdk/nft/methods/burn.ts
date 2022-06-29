import type { BN } from "@project-serum/anchor"
import { serialize } from "borsh"
import type { Connection, PublicKey } from "@solana/web3.js"
import { TransactionInstruction } from "@solana/web3.js"
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import type { IWalletSigner } from "@rarible/solana-wallet"
import type { BigNumberValue } from "@rarible/utils"
import { alignBn, bigNumToBn, bnToBuffer } from "../../../common/utils"

export interface ITokenBurnRequest {
	connection: Connection
	signer: IWalletSigner
	tokenAccount: PublicKey
	mint: PublicKey
	amount: BigNumberValue
	owner?: PublicKey // owner authority for tokenAccount
	close?: boolean // close the token account after burning the token
}

export async function getTokenBurnInstructions(
	request: ITokenBurnRequest,
) {
	const instructions = []
	const signers = [request.signer]

	instructions.push(
		createBurnTokenInstruction(
			request.mint,
			request.tokenAccount,
			request.owner ?? request.signer.publicKey,
			alignBn(bigNumToBn(request.amount), 8),
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

export function createBurnTokenInstruction(
	mint: PublicKey,
	tokenAccount: PublicKey,
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
		instruction: 8,
		amount: bnToBuffer(amount, "le", 8),
	}))

	const keys = [{
		pubkey: tokenAccount,
		isSigner: false,
		isWritable: true,
	}, {
		pubkey: mint,
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