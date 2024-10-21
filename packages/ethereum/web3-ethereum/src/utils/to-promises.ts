import type { PromiEvent, TransactionReceipt } from "web3-core"

export function toPromises(promiEvent: PromiEvent<unknown>) {
  return {
    hash: getPromiEventHashPromise(promiEvent),
    receipt: getPromiEventReceiptPromise(promiEvent),
  }
}

export function getPromiEventReceiptPromise(promiEvent: PromiEvent<unknown>): Promise<TransactionReceipt> {
  return new Promise<TransactionReceipt>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("PromiEvent timeout")), 1000 * 60 * 30)
    promiEvent.once("error", err => {
      reject(err)
      clearTimeout(timeout)
    })
    promiEvent.once("receipt", receipt => {
      resolve(receipt)
      clearTimeout(timeout)
    })
  })
}

export function getPromiEventHashPromise(promiEvent: PromiEvent<unknown>): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("PromiEvent timeout")), 1000 * 60 * 30)
    promiEvent.once("error", err => {
      reject(err)
      clearTimeout(timeout)
    })
    promiEvent.once("transactionHash", hash => {
      resolve(hash)
      clearTimeout(timeout)
    })
  })
}
