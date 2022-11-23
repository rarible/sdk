import type * as EthereumProvider from "@rarible/ethereum-provider"
import type { AbiItem } from "web3-utils"
import type { TransactionReceipt } from "web3-core"
// @ts-ignore
import web3EthAbi from "web3-eth-abi"
import web3Utils from "web3-utils"
import type { Address } from "@rarible/types"

export async function getContractMethodReceiptEvents(
	receiptPromise: Promise<TransactionReceipt>
): Promise<EthereumProvider.EthereumTransactionEvent[]> {
	const receipt = await receiptPromise
	return receipt.events ? Object.keys(receipt.events!)
		.map(ev => receipt.events![ev])
		.map(ev => ({
			...ev,
			args: ev.returnValues,
		})) : []
}

export async function getTransactionReceiptEvents(
	receiptPromise: Promise<TransactionReceipt>,
	address: Address,
	abi: AbiItem[],
): Promise<EthereumProvider.EthereumTransactionEvent[]> {
	const eventsResponse = parseReceiptEvents(
		abi,
		address,
		await receiptPromise
	)
	return Object.values(eventsResponse) || []
}

/**
 * Parse receipt events of the given contract.
 *
 * Web3 only parses the events of the contract that is returning the receipt. If
 * there are additional events logged by other contracts that were called during
 * the execution of the transaction, those will not be parsed automatically. For
 * those cases, additional parsing effort is required.
 *
 * @param {AbiItem[]} abi The ABI of the contract.
 * @param {string} address The address of the contract.
 * @param {TransactionReceipt} receipt The receipt to parse.
 * @returns {TransactionReceipt} The patched receipt.
 */
export function parseReceiptEvents(
	abi: AbiItem[], address: Address, receipt: TransactionReceipt
): EthereumProvider.EthereumTransactionEvent[] {
	// @ts-ignore
	const events = []

	if (receipt.logs) {

		receipt.events = {}

		receipt.logs.forEach(function (log) {
			// @ts-ignore
			log.returnValues = {}
			// @ts-ignore
			log.signature = null
			// @ts-ignore
			log.raw = {
				data: log.data,
				topics: log.topics,
			}
			// @ts-ignore
			delete log.data
			// @ts-ignore
			delete log.topics

			const eventNumber = log.logIndex
			// @ts-ignore
			receipt.events[eventNumber] = log
		})

		// @ts-ignore
		delete receipt.logs
	}

	// @ts-ignore
	Object.keys(receipt.events).forEach(function (n) {
		// @ts-ignore
		const event = receipt.events[n]

		if (web3Utils.toChecksumAddress(event.address)
      // @ts-ignore
      !== web3Utils.toChecksumAddress(address) || event.signature) {
			return
		}

		const descriptor = abi
			.filter(desc => desc.type === "event")
			.map(desc => ({
				...desc,
				// @ts-ignore
				signature: desc.signature || web3EthAbi.encodeEventSignature(desc),
			}))
		// @ts-ignore
			.find(desc => desc.signature === event.raw.topics[0])

		// @ts-ignore
		event.event = descriptor.name
		// @ts-ignore
		event.signature = descriptor.signature
		event.returnValues = web3EthAbi.decodeLog(
			// @ts-ignore
			descriptor.inputs,
			// @ts-ignore
			event.raw.data,
			// @ts-ignore
			event.raw.topics.slice(1)
		)
		events.push(event)


		delete event.returnValues.__length__
		// @ts-ignore
		delete receipt.events[n]
	})

	let count = 0
	// @ts-ignore
	events.forEach(function (ev) {
		if (ev.event) {
			// @ts-ignore
			if (receipt.events[ev.event]) {
				// @ts-ignore
				if (Array.isArray(receipt.events[ev.event])) {
					// @ts-ignore
					receipt.events[ev.event].push(ev)
				} else {
					// @ts-ignore
					receipt.events[ev.event] = [receipt.events[ev.event], ev]
				}
			} else {
				// @ts-ignore
				receipt.events[ev.event] = ev
			}
		} else {
			// @ts-ignore
			receipt.events[count] = ev
			// @ts-ignore
			count += 1
		}
	})

	return receipt?.events as any
}
