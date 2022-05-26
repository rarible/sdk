import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID } from "./contracts"

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
