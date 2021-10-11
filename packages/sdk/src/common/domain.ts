import { Blockchain } from "@rarible/api-client"
import { Action } from "@rarible/action"

//todo draft. probably will be changed in future
export type CurrencyType = {
	blockchain: Blockchain
	type: CurrencySubType
}

export type CurrencySubType = "NATIVE" | "ERC20"

export interface AbstractPrepareResponse<Id, In, Out> {
	submit: Action<Id, In, Out>
}
