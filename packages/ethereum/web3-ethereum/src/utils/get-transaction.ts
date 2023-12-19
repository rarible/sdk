import { backOff } from "exponential-backoff"
import { promiseSettledRequest } from "@rarible/sdk-common"
import type Web3 from "web3"

export async function getTransaction(hash: string, config: {web3: Web3, alternateWeb3Instance?: Web3}) {
	return backOff(async () => {
		const txs = await promiseSettledRequest([
			config.web3.eth.getTransaction(hash),
			config.alternateWeb3Instance?.eth.getTransaction(hash),
		])
		const foundTx = txs.find(tx => tx)
		if (!foundTx) throw new Error("No transaction found")
		return foundTx
	}, {
		maxDelay: 5000,
		numOfAttempts: 20,
		delayFirstAttempt: true,
		startingDelay: 300,
	})
}
