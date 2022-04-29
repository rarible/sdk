import { Blockchain } from "@rarible/api-client"
import type { CurrencyType } from "../../../common/domain"

export function getCurrencies():  CurrencyType[] {
	return [{ blockchain: Blockchain.SOLANA, type: "NATIVE" }]
}
