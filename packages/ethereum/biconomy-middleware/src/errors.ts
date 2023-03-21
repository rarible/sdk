export class BiconomyMiddlewareError extends Error {
  data: any
  error: any

  constructor(data: { error: any, data: any, message?: string }) {
  	super(data.message || data?.error?.message || "SignTypedDataError")
  	Object.setPrototypeOf(this, BiconomyMiddlewareError.prototype)
  	this.name = "BiconomyMiddlewareError"
  	this.error = data?.error
  	this.data = data?.data
  }
}
