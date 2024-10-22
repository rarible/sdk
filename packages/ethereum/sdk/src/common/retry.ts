import { conditionalRetry, FAILED_TO_FETCH_ERROR } from "@rarible/sdk-common"

export function retry<T>(num: number, del: number, thunk: () => Promise<T>): Promise<T> {
  return thunk().catch(error => {
    if (num === 0) {
      throw error
    }
    return delay(del).then(() => retry(num - 1, del, thunk))
  })
}

export function delay(num: number) {
  return new Promise<void>(r => setTimeout(r, num))
}

export function wrapInRetry<T>(thunk: () => Promise<T>) {
  return conditionalRetry(5, 3000, thunk, error => error?.message === FAILED_TO_FETCH_ERROR)
}
