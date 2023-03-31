import type { Address, Part } from "@rarible/ethereum-api-client"
import type { BigNumber } from "@rarible/types"
import { ZERO_ADDRESS } from "@rarible/types"
import { packFeesToUint, ZERO_FEE_VALUE } from "./origin-fees-utils"

/**
 * Class used to reduce multiple originFee Part records (from different fill requests) to 2 values.
 */
export class OriginFeeReducer {
	private readonly addresses: [Address, Address]

	constructor() {
		this.addresses = [ZERO_ADDRESS, ZERO_ADDRESS]
	}

	/**
	 * Reduce fees to converted single uint fee value
	 * @param originFees
	 */
	reduce(originFees: Part[] | undefined): BigNumber {
		if (!originFees?.length) {
			return ZERO_FEE_VALUE
		}

		if (originFees.length > 2) {
			throw new Error("Supports max up to 2 different origin fee address per request")
		}

		const fees = originFees.reduce<[number, number]>((acc, originFee: Part) => {
			const res = this.reducePart(originFee)
			acc[0] += res[0]
			acc[1] += res[1]
			return acc
		}, [0, 0])

		return packFeesToUint(fees)
	}

	/**
	 * Return addresses for fees
	 */
	getAddresses(): [Address, Address] {
		return this.addresses
	}

	private reducePart(part: Part): [number, number] {
		let firstFee = 0
		let secondFee = 0

		if (part.account === this.addresses[0]) {
			firstFee += part.value
		} else if (part.account === this.addresses[1]) {
			secondFee += part.value
		} else if (this.addresses[0] === ZERO_ADDRESS) {
			firstFee += part.value
			this.addresses[0] = part.account
		} else if (this.addresses[1] === ZERO_ADDRESS) {
			secondFee += part.value
			this.addresses[1] = part.account
		} else {
			throw new Error("Supports max up to 2 different origin fee address per request")
		}

		return [firstFee, secondFee]
	}

}
