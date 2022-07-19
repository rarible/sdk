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
import type { AccountInfo } from "@solana/spl-token"
import BigNumber from "bignumber.js"
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
	connection: Connection,
	price: BigNumber,
	mint: PublicKey,
	walletKeyPair: any,
): Promise<BigNumber> {
	const token = new Token(
		connection,
		mint,
		TOKEN_PROGRAM_ID,
		walletKeyPair,
	)

	const mintInfo = await token.getMintInfo()

	const mantissa = 10 ** mintInfo.decimals

	return price.multipliedBy(mantissa).integerValue(BigNumber.ROUND_CEIL)
}

export async function getAccountInfo(
	connection: Connection,
	mint: PublicKey,
	walletKeyPair: any,
	tokenAccount: PublicKey,
): Promise<AccountInfo> {
	const token = new Token(
		connection,
		mint,
		TOKEN_PROGRAM_ID,
		walletKeyPair,
	)

	return await token.getAccountInfo(tokenAccount)
}

export async function getAssociatedTokenAccountForMint(
	mint: PublicKey,
	publicKey: PublicKey,
): Promise<[PublicKey, number]> {
	return await PublicKey.findProgramAddress(
		[
			publicKey.toBuffer(),
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
): Promise<BigNumber> {
	let amount = new BigNumber(0)
	if (!mint.equals(WRAPPED_SOL_MINT)) {
		try {
			const token = await connection.getTokenAccountBalance(account, "confirmed")
			if (token?.value?.uiAmount) {
				amount = integer ?
					new BigNumber(token.value.uiAmount).multipliedBy(Math.pow(10, token.value.decimals)) :
					new BigNumber(token.value.uiAmount)
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
		amount = new BigNumber(await connection.getBalance(account, "confirmed"))
		amount = integer ? amount : amount.dividedBy(LAMPORTS_PER_SOL)
	}
	return amount
}
