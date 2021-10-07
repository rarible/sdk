import { Blockchain } from "@rarible/api-client"

//todo draft. probably will be changed in future
export type CurrencyType = {
	blockchain: Blockchain
	type: CurrencySubType
}

export type CurrencySubType = "NATIVE" | "ERC20"
