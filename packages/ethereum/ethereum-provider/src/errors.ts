import type { Provider } from "./domain"
import { isObject } from "./sign-typed-data"

export type EthereumProviderErrorData = {
	error: any
	data: any
	provider?: Provider
	providerId?: any
	method: string
	code?: string | number
	signer?: string
	chainId?: number
	blockNumber?: number
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
  blockNumber?: number

  constructor(data: EthereumProviderErrorData) {
  	super(EthereumProviderError.getErrorMessage(data))
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
  	this.blockNumber = data?.blockNumber
  }

  static getErrorMessage({ error, data, chainId }: EthereumProviderErrorData) {
  	const sourceError = typeof error === "string" ? error : (error?.message || "EthereumProviderError")
  	if (isObject(data) && data.args && data.method && data.contract) {
  		return [
  			sourceError,
  			`chainId: ${chainId || ""}`,
  			`contract: ${data.contract}`,
  			`method: ${data.method}`,
  			`args: ${JSON.stringify(data.args, null, " ")}`,
  		].join("\n")
  	}
  	return sourceError
  }

  getNewStack(error: any) {
  	try {
  		return (this.stack?.split("\n").slice(0, 2).join("\n") + "\n" + error.stack) || this.stack
  	} catch (e) {
  		return this.stack || error.stack
  	}
  }
}
