import type { ethers, Contract } from "ethers"
import type { EthereumTransactionEvent } from "@rarible/ethereum-provider"

export async function getTxEvents(
	receipt: ethers.providers.TransactionReceipt,
	contract: Contract
): Promise<EthereumTransactionEvent[]> {
	try {
		return receipt.logs.map(log => {
			try {
				const parsedEvent = contract.interface.parseLog(log)
				return {
					...log,
					event: parsedEvent.name,
					args: parsedEvent.args,
					returnValues: parsedEvent.args,
				}
			} catch (e) {
				return {
					...log,
					event: "",
					returnValues: {},
					args: {},
				}
			}
		})
	} catch (e) {
		console.log(e)
		return []
	}
}
