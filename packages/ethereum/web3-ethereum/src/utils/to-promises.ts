import type { PromiEvent, TransactionReceipt } from "web3-core"

export function toPromises(promiEvent: PromiEvent<any>) {
	return {
		hash: new Promise<string>((resolve, reject) => {
			promiEvent.once("error", reject)
			promiEvent.once("transactionHash", resolve)
		}),
		receipt: new Promise<TransactionReceipt>((resolve, reject) => {
			promiEvent.once("error", reject)
			promiEvent.once("receipt", resolve)
		}),
	}
}
