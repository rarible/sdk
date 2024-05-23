import { toCollectionId, toCurrencyId, toItemId, toOrderId, toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { extractId } from "@rarible/sdk-common"
import type { UnionPart } from "../../../types/order/common"

export const APTOS_ZERO_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000000"
export const APTOS_CURRENCY_ID_ZERO_ADDRESS = toCurrencyId(`${Blockchain.APTOS}:${APTOS_ZERO_ADDRESS}`)

export function convertAptosToUnionAddress(address: string) {
	return toUnionAddress(`${Blockchain.APTOS}:${address}`)
}

export function convertAptosToUnionOrderId(orderId: string) {
	return toOrderId(`${Blockchain.APTOS}:${orderId}`)
}
export function convertAptosToUnionCollectionId(collection: string) {
	return toCollectionId(`${Blockchain.APTOS}:${collection}`)
}

export function convertAptosToUnionItemId(item: string) {
	return toItemId(`${Blockchain.APTOS}:${item}`)
}

export function getSupportedCurrencies(): [{ blockchain: Blockchain.APTOS, type: "NATIVE" }] {
	return [{ blockchain: Blockchain.APTOS, type: "NATIVE" }]
}

export async function getFeeObject({ originFees, defaultFeeAddress, createFeeSchedule }: {
	originFees: UnionPart[],
	defaultFeeAddress: string,
	createFeeSchedule: (options: { receiveAddress: string, value: number}) => Promise<string>
}): Promise<string> {
	if (!originFees || !originFees.length) return defaultFeeAddress
	if (originFees.length > 1) {
		throw new Error("Origin fees should consist only 1 item")
	}
	if (originFees[0].value === 0) {
		return originFees[0].account
	} else if (originFees[0].value > 0) {
		return createFeeSchedule({
			value: originFees[0].value,
			receiveAddress: extractId(originFees[0].account),
		})
	} else {
		throw new Error(`Incorrect originFee value=${originFees[0].value}`)
	}
}
