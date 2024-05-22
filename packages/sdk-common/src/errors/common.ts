import { isObjectLike } from "../utils"

export class WalletIsUndefinedError extends Error {
  constructor() {
    super("Wallet is not defined")
    this.name = "WalletIsUndefinedError"
    Object.setPrototypeOf(this, WalletIsUndefinedError.prototype)
  }
}

export interface ICancelError extends Error {
  __IS_WRAPPED_ERROR__: true
}

export class WrappedError extends Error implements ICancelError {
  readonly __IS_WRAPPED_ERROR__ = true
  error: unknown

  constructor(error: unknown, msg: string) {
    super(msg)
    Object.setPrototypeOf(this, WrappedError.prototype)
    this.error = error
  }
  static isWrappedError(original: unknown): original is WrappedError {
    if (original instanceof WrappedError) return true

    if (isObjectLike(original)) {
      if (original.constructor.name === "WrappedError") return true
      if ((original as WrappedError).__IS_WRAPPED_ERROR__) return true
    }
    return false
  }
}

export class UserCancelError extends WrappedError {
  readonly __IS_WRAPPED_ERROR__ = true

  constructor(error: unknown) {
    super(error, "Request cancelled by user")
    this.name = "UserCancelError"
    Object.setPrototypeOf(this, UserCancelError.prototype)
  }
}

export const FAILED_TO_FETCH_ERROR = "Failed to fetch"
