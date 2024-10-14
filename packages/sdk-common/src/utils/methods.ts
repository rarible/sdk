import { Action } from "@rarible/action"

export function getNotImplementedFn(message = "Not implemented") {
  return (): never => {
    throw new NotImplementedError(message)
  }
}

export class NotImplementedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "NotImplementedError"
    Object.setPrototypeOf(this, NotImplementedError.prototype)
  }
}

export function getNonImplementedAction(msg?: string) {
  return Action.create<any, any, any>({
    id: "non-implemented",
    run: getNotImplementedFn(msg),
  })
}

export const notImplemented = getNotImplementedFn()

export const nonImplementedAction = getNonImplementedAction()

export function getDeprecatedMethodFn(message = "Deprecated method") {
  return (): never => {
    throw new DeprecatedMethodError(message)
  }
}

export class DeprecatedMethodError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DeprecatedMethodError"
    Object.setPrototypeOf(this, DeprecatedMethodError.prototype)
  }
}

export function getDeprecatedAction(msg?: string) {
  return Action.create<any, any, any>({
    id: "non-implemented",
    run: getDeprecatedMethodFn(msg),
  })
}

export const deprecatedMethod = getDeprecatedMethodFn()
export const deprecatedMethodAction = getDeprecatedAction()
