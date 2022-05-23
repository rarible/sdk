import type { Connection } from "@solana/web3.js"
import { PublicKey } from "@solana/web3.js"
import type { IWalletSigner } from "@rarible/solana-wallet"
import type { BN } from "@project-serum/anchor"
import { Program, Provider } from "@project-serum/anchor"
import { AUCTION_HOUSE, AUCTION_HOUSE_PROGRAM_ID } from "./contracts"
import { bnToBuffer } from "./utils"

export async function loadAuctionHouseProgram(
	connection: Connection,
	signer: IWalletSigner
) {
	const provider = new Provider(connection, signer, {
		preflightCommitment: "recent",
	})
	const idl = await Program.fetchIdl(AUCTION_HOUSE_PROGRAM_ID, provider)
	return new Program(idl!, AUCTION_HOUSE_PROGRAM_ID, provider)
}


export async function getAuctionHouseProgramAsSigner (): Promise<[PublicKey, number]> {
	return await PublicKey.findProgramAddress(
		[Buffer.from(AUCTION_HOUSE), Buffer.from("signer")], AUCTION_HOUSE_PROGRAM_ID,
	)
}

export async function getAuctionHouseTradeState (
	auctionHouse: PublicKey,
	wallet: PublicKey,
	tokenAccount: PublicKey,
	treasuryMint: PublicKey,
	tokenMint: PublicKey,
	tokenSize: BN,
	buyPrice: BN,
): Promise<[PublicKey, number]> {
	return await PublicKey.findProgramAddress(
		[
			Buffer.from(AUCTION_HOUSE),
			wallet.toBuffer(),
			auctionHouse.toBuffer(),
			tokenAccount.toBuffer(),
			treasuryMint.toBuffer(),
			tokenMint.toBuffer(),
			bnToBuffer(buyPrice, "le", 8),
			bnToBuffer(tokenSize, "le", 8),
		],
		AUCTION_HOUSE_PROGRAM_ID,
	)
}

export async function getAuctionHouseBuyerEscrow(
	auctionHouse: PublicKey,
	wallet: PublicKey,
): Promise<[PublicKey, number]> {
	return await PublicKey.findProgramAddress(
		[Buffer.from(AUCTION_HOUSE), auctionHouse.toBuffer(), wallet.toBuffer()],
		AUCTION_HOUSE_PROGRAM_ID,
	)
}