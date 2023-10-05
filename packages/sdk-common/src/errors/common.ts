export class WalletIsUndefinedError extends Error {
	constructor() {
		super("Wallet is not defined")
		this.name = "WalletIsUndefinedError"
		Object.setPrototypeOf(this, WalletIsUndefinedError.prototype)
	}
}

export class UserCancelError extends Error {
  error: any
  constructor(error: unknown) {
  	super("Request cancelled by user")
  	this.name = "UserCancelError"
  	this.error = error
  	Object.setPrototypeOf(this, UserCancelError.prototype)
  }
}

export const FAILED_TO_FETCH_ERROR = "Failed to fetch"
