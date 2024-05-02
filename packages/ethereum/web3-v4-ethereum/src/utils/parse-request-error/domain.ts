export const ethereumProviderErrors = [
	-32000,
	-32001,
	-32002,
	-32003,
	-32004,
	-32005,
	-32700,
	-32600,
	-32601,
	-32602,
	-32603,
] as const

export type EthereumProviderErrorCode = typeof ethereumProviderErrors[number]

export const ethereumRpcErrors = [
	4001,
	4100,
	4200,
	4900,
	4901,
] as const

export type EthereumRpcErrorCode = typeof ethereumRpcErrors[number]

export interface ProviderRequestError extends Error {
	code: EthereumRpcErrorCode | EthereumProviderErrorCode
	message: string
}