//todo ship to flow-sdk or fcl types and remove from here
export interface FlowCurrentUser {
	snapshot(): Promise<any>

	signUserMessage(message: string): Promise<FlowSignature[]>
}

export type FlowAccount = {
	address: string
	balance: number
	code: string
	contracts: { [key: string]: string }
	keys: FlowAccountKey[]
}
type FlowAccountKey = {
	hashAlgo: number
	index: number
	publicKey: string
	revoked: boolean
	sequenceNumber: number
	signAlgo: number
	weight: number
}

export type FlowSignature = {
	addr: string
	signature: string
	keyId: number
}
