export interface IBiconomyConfig {
	apiKey: string,
	debug?: boolean,
}

export type ContractMetadata = {
	types: {
		EIP712Domain: {name: string, type: string}[]
		MetaTransaction: {name: string, type: string}[],
	},
	domain: Record<string, any>,
	primaryType: string,
	allowedFunctions?: string[],
	[key: string]: any
}

type BiconomyApiCommonResponse = {
	code: number
	message: string
}

export type BiconomyApiLimitResponse = BiconomyApiCommonResponse & ({
	limit: {
		allowed: boolean
		limitLeft: number
		resetTime: number
		type: number
	}
	allowed: false
} | {
	allowed: true
})

export interface IContractRegistry {
	getMetadata(address: string, data?: string): Promise<ContractMetadata | undefined>
}

export interface ILimitsRegistry {
	checkLimits(userAddress: string): Promise<BiconomyApiLimitResponse>
}
