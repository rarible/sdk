import type { Connection } from "@solana/web3.js"
import {
	LAMPORTS_PER_SOL,
	PublicKey,
	SystemProgram,
	SYSVAR_RENT_PUBKEY,
	TransactionInstruction,
} from "@solana/web3.js"
import type { Program } from "@project-serum/anchor"
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID, WRAPPED_SOL_MINT } from "./contracts"

export async function getTokenWallet(
	wallet: PublicKey,
	mint: PublicKey,
) {
	return (
		await PublicKey.findProgramAddress(
			[wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
			SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
		)
	)[0]
}

export function createAssociatedTokenAccountInstruction(
	associatedTokenAddress: PublicKey,
	payer: PublicKey,
	walletAddress: PublicKey,
	splTokenMintAddress: PublicKey,
) {
	const keys = [
		{
			pubkey: payer,
			isSigner: true,
			isWritable: true,
		},
		{
			pubkey: associatedTokenAddress,
			isSigner: false,
			isWritable: true,
		},
		{
			pubkey: walletAddress,
			isSigner: false,
			isWritable: false,
		},
		{
			pubkey: splTokenMintAddress,
			isSigner: false,
			isWritable: false,
		},
		{
			pubkey: SystemProgram.programId,
			isSigner: false,
			isWritable: false,
		},
		{
			pubkey: TOKEN_PROGRAM_ID,
			isSigner: false,
			isWritable: false,
		},
		{
			pubkey: SYSVAR_RENT_PUBKEY,
			isSigner: false,
			isWritable: false,
		},
	]
	return new TransactionInstruction({
		keys,
		programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
		data: Buffer.from([]),
	})
}
export async function getMetadata(
	mint: PublicKey,
): Promise<PublicKey> {
	return (
		await PublicKey.findProgramAddress(
			[
				Buffer.from("metadata"),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				mint.toBuffer(),
			],
			TOKEN_METADATA_PROGRAM_ID,
		)
	)[0]
}

export function createMetadataInstruction(
	metadataAccount: PublicKey,
	mint: PublicKey,
	mintAuthority: PublicKey,
	payer: PublicKey,
	updateAuthority: PublicKey,
	txnData: Buffer,
) {
	const keys = [
		{
			pubkey: metadataAccount,
			isSigner: false,
			isWritable: true,
		},
		{
			pubkey: mint,
			isSigner: false,
			isWritable: false,
		},
		{
			pubkey: mintAuthority,
			isSigner: true,
			isWritable: false,
		},
		{
			pubkey: payer,
			isSigner: true,
			isWritable: false,
		},
		{
			pubkey: updateAuthority,
			isSigner: false,
			isWritable: false,
		},
		{
			pubkey: SystemProgram.programId,
			isSigner: false,
			isWritable: false,
		},
		{
			pubkey: SYSVAR_RENT_PUBKEY,
			isSigner: false,
			isWritable: false,
		},
	]
	return new TransactionInstruction({
		keys,
		programId: TOKEN_METADATA_PROGRAM_ID,
		data: txnData,
	})
}

export function createMasterEditionInstruction(
	metadataAccount: PublicKey,
	editionAccount: PublicKey,
	mint: PublicKey,
	mintAuthority: PublicKey,
	payer: PublicKey,
	updateAuthority: PublicKey,
	txnData: Buffer,
) {
	const keys = [
		{
			pubkey: editionAccount,
			isSigner: false,
			isWritable: true,
		},
		{
			pubkey: mint,
			isSigner: false,
			isWritable: true,
		},
		{
			pubkey: updateAuthority,
			isSigner: true,
			isWritable: false,
		},
		{
			pubkey: mintAuthority,
			isSigner: true,
			isWritable: false,
		},
		{
			pubkey: payer,
			isSigner: true,
			isWritable: false,
		},
		{
			pubkey: metadataAccount,
			isSigner: false,
			isWritable: true,
		},
		{
			pubkey: TOKEN_PROGRAM_ID,
			isSigner: false,
			isWritable: false,
		},
		{
			pubkey: SystemProgram.programId,
			isSigner: false,
			isWritable: false,
		},
		{
			pubkey: SYSVAR_RENT_PUBKEY,
			isSigner: false,
			isWritable: false,
		},
	]
	return new TransactionInstruction({
		keys,
		programId: TOKEN_METADATA_PROGRAM_ID,
		data: txnData,
	})
}

export async function getMasterEdition(
	mint: PublicKey,
): Promise<PublicKey> {
	return (
		await PublicKey.findProgramAddress(
			[
				Buffer.from("metadata"),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				mint.toBuffer(),
				Buffer.from("edition"),
			],
			TOKEN_METADATA_PROGRAM_ID,
		)
	)[0]
}

export async function getPriceWithMantissa(
	price: number,
	mint: PublicKey,
	walletKeyPair: any,
	anchorProgram: Program,
): Promise<number> {
	const token = new Token(
		anchorProgram.provider.connection,
		new PublicKey(mint),
		TOKEN_PROGRAM_ID,
		walletKeyPair,
	)

	const mintInfo = await token.getMintInfo()

	const mantissa = 10 ** mintInfo.decimals

	return Math.ceil(price * mantissa)
}

export async function getAssociatedTokenAccountForMint(
	mint: PublicKey,
	buyer: PublicKey,
): Promise<[PublicKey, number]> {
	return await PublicKey.findProgramAddress(
		[
			buyer.toBuffer(),
			TOKEN_PROGRAM_ID.toBuffer(),
			mint.toBuffer(),
		],
		SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
	)
}

export async function getTokenAmount(
	connection: Connection,
	anchorProgram: Program,
	account: PublicKey,
	mint: PublicKey,
	integer: boolean = false
): Promise<number> {
	let amount = 0
	if (!mint.equals(WRAPPED_SOL_MINT)) {
		try {
			const token = await connection.getTokenAccountBalance(account)
			if (token?.value?.uiAmount) {
				amount = integer ? token.value.uiAmount * Math.pow(10, token.value.decimals) : token.value.uiAmount
			}
		} catch (e) {
			console.error(e)
			console.info(
				"Account ",
				account.toBase58(),
				"didnt return value. Assuming 0 tokens.",
			)
		}
	} else {
		amount = await connection.getBalance(account)
		amount = integer ? amount : amount / LAMPORTS_PER_SOL
	}
	return amount
}
