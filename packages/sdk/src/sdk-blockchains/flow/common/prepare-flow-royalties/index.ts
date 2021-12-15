import type { Royalty } from "@rarible/api-client"
import { toBn } from "@rarible/utils/build/bn"
import type { FlowRoyalty } from "@rarible/flow-sdk"
import { parseFlowAddressFromUnionAddress } from "../converters"
import { toBigNumber } from "../../../../types/build"

export function prepareFlowRoyalties(royalty: Royalty[] | undefined): FlowRoyalty[] {
	if (royalty && royalty.length > 0) {
		return royalty.map(r => {
			if (toBn(r.value).gt(10000)) {
				throw new Error("Value for royalty too big")
			}
			const account = parseFlowAddressFromUnionAddress(r.account)
			return {
				account,
				value: toBigNumber(toBn(r.value).div(10000).toString()),
			}
		})
	}
	return []
}
