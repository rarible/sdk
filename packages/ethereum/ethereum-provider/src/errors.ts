import type { Provider } from "./domain"

export class EthereumProviderError extends Error {
	data: any
	error: any
	provider: Provider
	method: string
	signer?: string
	constructor(data: { error: any, data: any, provider: Provider, method: string, signer?: string }) {
		super(data?.error?.message || "EthereumProviderError")
		Object.setPrototypeOf(this, EthereumProviderError.prototype)
		this.name = "EthereumProviderError"
		this.error = data?.error
		this.provider = data?.provider
		this.data = data?.data
		this.method = data?.method
		this.signer = data?.signer
	}
}
