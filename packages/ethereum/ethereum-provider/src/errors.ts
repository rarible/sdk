import type { Provider } from "./domain"

export type EthereumProviderErrorData = {
	error: any
	data: any
	provider?: Provider
	providerId?: any
	method: string
	code?: string | number
	signer?: string
	chainId?: number

}

export class EthereumProviderError extends Error {
  data: any
  error: any
  provider?: Provider
	providerId?: any
  method: string
  code?: string | number
  signer?: string
	chainId?: number

	constructor(data: EthereumProviderErrorData) {
  	super(EthereumProviderError.getErrorMessage(data?.error))
  	Object.setPrototypeOf(this, EthereumProviderError.prototype)
  	this.name = "EthereumProviderError"
  	this.error = data?.error
		if (data?.error?.stack) {
			this.stack = this.getNewStack(data?.error)
		}
  	this.provider = data?.provider
  	this.data = data?.data
  	this.method = data?.method
		this.code = data?.error?.code || data?.error?.error?.code || data?.code
		this.signer = data?.signer
		this.chainId = data?.chainId
		this.providerId = data?.providerId
	}

	static getErrorMessage(error: any) {
		if (typeof error === "string") return error
		return error?.message || "EthereumProviderError"
	}

	getNewStack(error: any) {
		try {
			return (this.stack?.split("\n").slice(0, 2).join("\n") + "\n" + error.stack) || this.stack
		} catch (e) {
			return this.stack || error.stack
		}
	}
}
