import type { PublicKey } from "@solana/web3.js"
import { toPublicKey } from "@rarible/solana-common"

const auctionHouseFee: Record<string, number> = {
	"8Qu3azqi31VpgPwVW99AyiBGnLSpookWQiwLMvFn4NFm": 1000, // 10%
}

export function getAuctionHouse(currency: "SOL"): PublicKey {
	switch (currency) {
		case "SOL":
		default:
			return toPublicKey("8Qu3azqi31VpgPwVW99AyiBGnLSpookWQiwLMvFn4NFm")
	}
}

export async function getAuctionHouseFee(ah: PublicKey | string): Promise<number> {
	if (typeof ah === "string") {
		return auctionHouseFee[ah] ?? 0
	} else {
		return auctionHouseFee[ah.toString()] ?? 0
	}
}
