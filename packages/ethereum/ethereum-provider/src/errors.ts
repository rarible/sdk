import type { Provider } from "./domain"

export type EthereumProviderErrorData = {
	error: any
	data: any
	provider?: Provider
	method: string
	code?: string | number
	signer?: string
	chainId?: number

}

export class EthereumProviderError extends Error {
  data: any
  error: any
  provider?: Provider
  method: string
  code?: string | number
  signer?: string
	chainId?: number

	constructor(data: EthereumProviderErrorData) {
  	super(data?.error?.message || "EthereumProviderError")
  	Object.setPrototypeOf(this, EthereumProviderError.prototype)
  	this.name = "EthereumProviderError"
  	this.error = data?.error
  	this.provider = data?.provider
  	this.data = data?.data
  	this.method = data?.method
  	this.code = data?.code
  	this.signer = data?.signer
		this.chainId = data?.chainId
	}
}
