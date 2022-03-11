import * as anchor from "@project-serum/anchor"
import type { Connection, PublicKey } from "@solana/web3.js"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { web3 } from "@project-serum/anchor"
import type { Program } from "@project-serum/anchor"
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { AUCTION_HOUSE, AUCTION_HOUSE_PROGRAM_ID, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from "../../contracts"

export async function loadAuctionHouseProgram(
	connection: Connection,
	signer: IWalletSigner
) {
	const provider = new anchor.Provider(connection, signer, {
		preflightCommitment: "recent",
	})
	const idl = await anchor.Program.fetchIdl(AUCTION_HOUSE_PROGRAM_ID, provider)
	return new anchor.Program(idl!, AUCTION_HOUSE_PROGRAM_ID, provider)
}

export async function getPriceWithMantissa(
	price: number,
	mint: web3.PublicKey,
	walletKeyPair: any,
	anchorProgram: Program,
): Promise<number> {
	const token = new Token(
		anchorProgram.provider.connection,
		new web3.PublicKey(mint),
		TOKEN_PROGRAM_ID,
		walletKeyPair,
	)

	const mintInfo = await token.getMintInfo()

	const mantissa = 10 ** mintInfo.decimals

	return Math.ceil(price * mantissa)
}

export async function getAssociatedTokenAccountForMint(
	mint: web3.PublicKey,
	buyer: web3.PublicKey,
): Promise<[anchor.web3.PublicKey, number]> {
	return await web3.PublicKey.findProgramAddress(
		[
			buyer.toBuffer(),
			TOKEN_PROGRAM_ID.toBuffer(),
			mint.toBuffer(),
		],
		SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
	)
}

export async function getAuctionHouseProgramAsSigner (): Promise<[PublicKey, number]> {
	return await web3.PublicKey.findProgramAddress(
		[Buffer.from(AUCTION_HOUSE), Buffer.from("signer")], AUCTION_HOUSE_PROGRAM_ID,
	)
}

export async function getAuctionHouseTradeState (
	auctionHouse: web3.PublicKey,
	wallet: web3.PublicKey,
	tokenAccount: web3.PublicKey,
	treasuryMint: web3.PublicKey,
	tokenMint: web3.PublicKey,
	tokenSize: anchor.BN,
	buyPrice: anchor.BN,
): Promise<[PublicKey, number]> {
	return await web3.PublicKey.findProgramAddress(
		[
			Buffer.from(AUCTION_HOUSE),
			wallet.toBuffer(),
			auctionHouse.toBuffer(),
			tokenAccount.toBuffer(),
			treasuryMint.toBuffer(),
			tokenMint.toBuffer(),
			buyPrice.toBuffer("le", 8),
			tokenSize.toBuffer("le", 8),
		],
		AUCTION_HOUSE_PROGRAM_ID,
	)
}

export async function getAuctionHouseBuyerEscrow(
	auctionHouse: web3.PublicKey,
	wallet: web3.PublicKey,
): Promise<[PublicKey, number]> {
	return await web3.PublicKey.findProgramAddress(
		[Buffer.from(AUCTION_HOUSE), auctionHouse.toBuffer(), wallet.toBuffer()],
		AUCTION_HOUSE_PROGRAM_ID,
	)
}