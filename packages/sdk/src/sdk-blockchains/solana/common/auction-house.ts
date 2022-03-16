import type { PublicKey } from "@solana/web3.js"
import { toPublicKey } from "@rarible/solana-common"

export function getAuctionHouse(currency: "SOL"): PublicKey {
	switch (currency) {
		case "SOL":
		default:
			return toPublicKey("8Qu3azqi31VpgPwVW99AyiBGnLSpookWQiwLMvFn4NFm")
	}
}
