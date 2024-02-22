import type * as EthereumProvider from "@rarible/ethereum-provider"
import type { Address } from "@rarible/types"
import { utils, eth } from "web3-v4"
import type { ContractAbi } from "web3-v4"
import { deepReplaceBigInt } from "@rarible/sdk-common"
import type { TxReceiptNumberFormatted } from "../domain"


export async function getTransactionReceiptEvents(
	receiptPromise: Promise<TxReceiptNumberFormatted>,
	address: Address,
	abi: ContractAbi,
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
 * @param {ContractAbi} abi The ABI of the contract.
 * @param {string} address The address of the contract.
 * @param {TxReceiptNumberFormatted} receipt The receipt to parse.
 * @returns {TxReceiptNumberFormatted} The patched receipt.
 */
export function parseReceiptEvents(
	abi: ContractAbi, address: Address, receipt: TxReceiptNumberFormatted
): EthereumProvider.EthereumTransactionEvent[] {
	// @ts-ignore
	const events = []

	const eventsMap = {}
	if (receipt.logs) {

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

			const eventNumber = log.logIndex
			// @ts-ignore
			eventsMap[eventNumber] = log
		})

		// @ts-ignore
		delete receipt.logs
	}

	// @ts-ignore
	Object.keys(eventsMap).forEach(function (n) {
		// @ts-ignore
		const event = eventsMap[n]

		if (utils.toChecksumAddress(event.address)
      // @ts-ignore
      !== utils.toChecksumAddress(address) || event.signature) {
			return
		}

		const descriptor = abi
			.filter(desc => desc.type === "event")
			.map(desc => ({
				...desc,
				// @ts-ignore
				signature: desc.signature || eth.abi.encodeEventSignature(desc),
			}))
		// @ts-ignore
			.find(desc => desc.signature === event.raw.topics[0])

		// @ts-ignore
		event.event = descriptor.name
		// @ts-ignore
		event.signature = descriptor.signature
		const decodedLogs = eth.abi.decodeLog(
			// @ts-ignore
			descriptor.inputs,
			// @ts-ignore
			event.raw.data,
			// @ts-ignore
			event.raw.topics.slice(1)
		)

		event.returnValues = deepReplaceBigInt(decodedLogs)
		event.args = event.returnValues
		events.push(event)


		delete event.returnValues.__length__
		// @ts-ignore
		delete eventsMap[n]
	})

	let count = 0
	// @ts-ignore
	events.forEach(function (ev) {
		if (ev.event) {
			// @ts-ignore
			if (eventsMap[ev.event]) {
				// @ts-ignore
				if (Array.isArray(eventsMap[ev.event])) {
					// @ts-ignore
					eventsMap[ev.event].push(ev)
				} else {
					// @ts-ignore
					eventsMap[ev.event] = [eventsMap[ev.event], ev]
				}
			} else {
				// @ts-ignore
				eventsMap[ev.event] = ev
			}
		} else {
			// @ts-ignore
			eventsMap[count] = ev
			// @ts-ignore
			count += 1
		}
	})

	return eventsMap as any
}
