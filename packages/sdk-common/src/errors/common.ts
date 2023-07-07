export class WalletIsUndefinedError extends Error {
	constructor() {
		super("Wallet is not defined")
		this.name = "WalletIsUndefinedError"
		Object.setPrototypeOf(this, WalletIsUndefinedError.prototype)
	}
}
