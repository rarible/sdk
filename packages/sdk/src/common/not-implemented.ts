import { Action } from "@rarible/action"

export function getNotImplementedFn(message = "Not implemented") {
  return (): never => {
    throw new NotImplementedError(message)
  }
}

class NotImplementedError extends Error {
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
