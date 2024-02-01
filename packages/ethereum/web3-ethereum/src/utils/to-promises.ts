import type { Web3PromiEvent } from "web3-core"

export function toPromises<T>(promiEvent: Web3PromiEvent<T, any>) {
	return {
		hash: getPromiEventHashPromise(promiEvent),
		receipt: getPromiEventReceiptPromise(promiEvent),
	}
}

export function getPromiEventReceiptPromise<T>(promiEvent: Web3PromiEvent<T, any>): Promise<T> {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => reject(new Error("PromiEvent timeout")), 1000 * 60 * 30)
		promiEvent.once("error", (err) => {
			reject(err)
			clearTimeout(timeout)
		})
		promiEvent.once("receipt", receipt => {
			resolve(receipt)
			clearTimeout(timeout)
		})
		promiEvent.catch(err => {
			reject(err)
			clearTimeout(timeout)
		})
	})
}

export function getPromiEventHashPromise(
	promiEvent: Web3PromiEvent<any, any>
): Promise<string> {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => reject(new Error("PromiEvent timeout")), 1000 * 60 * 30)
		promiEvent.once("error", (err) => {
			reject(err)
			clearTimeout(timeout)
		})
		promiEvent.once("transactionHash", hash => {
			resolve(hash)
			clearTimeout(timeout)
		})
		promiEvent.catch(err => {
			reject(err)
			clearTimeout(timeout)
		})
	})
}


export function getPromiEventConfirmationPromise(promiEvent: Web3PromiEvent<any, any>): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		const timeout = setTimeout(() => reject(new Error("PromiEvent timeout")), 1000 * 60 * 30)
		promiEvent.once("error", (err) => {
			reject(err)
			clearTimeout(timeout)
		})
		promiEvent.once("confirmation", ({ receipt }) => {
			resolve(receipt.transactionHash)
			clearTimeout(timeout)
		})
		promiEvent.catch(err => {
			reject(err)
			clearTimeout(timeout)
		})
	})
}
