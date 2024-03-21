import type { Connection } from "@solana/web3.js"
import { PublicKey } from "@solana/web3.js"
import type { SolanaSigner } from "@rarible/solana-common"
import { toSolanaLegacySigner } from "@rarible/solana-common"
import { Program, Provider } from "@project-serum/anchor"
import type { BigNumber } from "@rarible/utils"
import { AUCTION_HOUSE, AUCTION_HOUSE_PROGRAM_ID } from "./contracts"
import { serumBnToBuffer, toSerumBn } from "./utils"

export async function loadAuctionHouseProgram(
	connection: Connection,
	signer: SolanaSigner
) {
	const legacySigner = toSolanaLegacySigner(signer)
	const provider = new Provider(connection, legacySigner, {
		preflightCommitment: "recent",
	})
	const idl = await Program.fetchIdl(AUCTION_HOUSE_PROGRAM_ID, provider)
	if (!idl) {
		throw new Error("Idl couldn't be fetched")
	}
	return new Program(idl, AUCTION_HOUSE_PROGRAM_ID, provider)
}

export function getAuctionHouseProgramAsSigner (): Promise<[PublicKey, number]> {
	return PublicKey.findProgramAddress(
		[
			Buffer.from(AUCTION_HOUSE),
			Buffer.from("signer"),
		],
		AUCTION_HOUSE_PROGRAM_ID
	)
}

export function getAuctionHouseTradeState (
	auctionHouse: PublicKey,
	wallet: PublicKey,
	tokenAccount: PublicKey,
	treasuryMint: PublicKey,
	tokenMint: PublicKey,
	tokenSize: BigNumber,
	buyPrice: BigNumber,
): Promise<[PublicKey, number]> {
	return PublicKey.findProgramAddress(
		[
			Buffer.from(AUCTION_HOUSE),
			wallet.toBuffer(),
			auctionHouse.toBuffer(),
			tokenAccount.toBuffer(),
			treasuryMint.toBuffer(),
			tokenMint.toBuffer(),
			serumBnToBuffer(toSerumBn(buyPrice), "le", 8),
			serumBnToBuffer(toSerumBn(tokenSize), "le", 8),
		],
		AUCTION_HOUSE_PROGRAM_ID,
	)
}

export function getAuctionHouseBuyerEscrow(
	auctionHouse: PublicKey,
	wallet: PublicKey,
): Promise<[PublicKey, number]> {
	return PublicKey.findProgramAddress(
		[
			Buffer.from(AUCTION_HOUSE),
			auctionHouse.toBuffer(),
			wallet.toBuffer(),
		],
		AUCTION_HOUSE_PROGRAM_ID,
	)
}