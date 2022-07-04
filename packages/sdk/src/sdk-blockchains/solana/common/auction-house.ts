import type { PublicKey } from "@solana/web3.js"
import type { SolanaNftAssetType, SolanaSolAssetType } from "@rarible/api-client"
import { toPublicKey } from "@rarible/solana-common"
import type { SolanaAuctionHouseMapping } from "../domain"
import { extractAddress } from "./address-converters"

const auctionHouseFee: Record<string, number> = {
	"raria47jXd4tdW6Dj7T64mgahwTjMsVaDwFxMHt9Jbp": 0, // base points (250 = 2.5%)
}

type CurrencyType = SolanaNftAssetType | SolanaSolAssetType

export function getAuctionHouse(
	currency: CurrencyType,
	auctionHouseMapping: SolanaAuctionHouseMapping | undefined
): PublicKey {
	if (currency["@type"] === "SOLANA_SOL") {
		if (auctionHouseMapping && auctionHouseMapping["SOLANA_SOL"]) {
			return toPublicKey(auctionHouseMapping["SOLANA_SOL"].address)
		}
		return toPublicKey("raria47jXd4tdW6Dj7T64mgahwTjMsVaDwFxMHt9Jbp")
	} else if (currency["@type"] === "SOLANA_NFT") {
		const mintAddress = extractAddress(currency.itemId)
		if (auctionHouseMapping && auctionHouseMapping[mintAddress]) {
			return toPublicKey(auctionHouseMapping[mintAddress].address)
		}
	}

	throw new Error("Auction House for specified currency not found")
}

export async function getAuctionHouseFee(
	ah: PublicKey | string,
	auctionHouseMapping: SolanaAuctionHouseMapping | undefined
): Promise<number> {
	const ahAddress = ah.toString()
	if (auctionHouseMapping) {
		const ahRecord = Object.values(auctionHouseMapping)
			.find((record) => record.address === ahAddress)

		if (ahRecord) {
			return ahRecord.baseFee
		}
	}

	if (auctionHouseFee[ahAddress] === undefined) {
		throw new Error("No fee info found for specified Auction House")
	}
	return auctionHouseFee[ahAddress]
}
