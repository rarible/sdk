import type { Web3PromiEvent } from "web3-core"

export function toPromises<T>(promiEvent: Web3PromiEvent<T, any>) {
  return {
    hash: getPromiEventHashPromise(promiEvent),
    receipt: getPromiEventReceiptPromise(promiEvent),
    confirmation: getPromiEventConfirmationPromise(promiEvent),
  }
}

export function getPromiEventReceiptPromise<T>(promiEvent: Web3PromiEvent<T, any>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("PromiEvent timeout")), 1000 * 60 * 30)
    promiEvent.once("error", err => {
      clearTimeout(timeout)
      reject(err)
    })
    promiEvent.once("receipt", receipt => {
      clearTimeout(timeout)
      resolve(receipt)
    })
    promiEvent.catch(err => {
      clearTimeout(timeout)
      reject(err)
    })
  })
}

export function getPromiEventHashPromise(promiEvent: Web3PromiEvent<any, any>): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("PromiEvent timeout")), 1000 * 60 * 30)
    promiEvent.once("error", err => {
      clearTimeout(timeout)
      reject(err)
    })
    promiEvent.once("transactionHash", hash => {
      clearTimeout(timeout)
      resolve(hash)
    })
    promiEvent.catch(err => {
      clearTimeout(timeout)
      reject(err)
    })
  })
}

export function getPromiEventConfirmationPromise(promiEvent: Web3PromiEvent<any, any>): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("PromiEvent timeout")), 1000 * 60 * 30)
    promiEvent.once("error", err => {
      clearTimeout(timeout)
      reject(err)
    })
    promiEvent.once("confirmation", ({ receipt }) => {
      clearTimeout(timeout)
      resolve(receipt.transactionHash)
    })
    promiEvent.catch(err => {
      clearTimeout(timeout)
      reject(err)
    })
  })
}
