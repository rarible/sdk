import { Royalty } from "@rarible/api-client/build/models/Royalty"
import { Royalty as FlowRoyalty } from "@rarible/flow-sdk/build/types"
import { toBn } from "@rarible/utils/build/bn"
import { parseFlowAddressFromUnionAddress } from "./converters"

export function prepareFlowRoyalties(royalty: Royalty[] | undefined): FlowRoyalty[] {
	if (royalty) {
		return royalty.map(r => {
			if (toBn(r.value).gt(10000)) {
				throw Error("Value for royalty too big")
			}
			const account = parseFlowAddressFromUnionAddress(r.account)
			return {
				account,
				value: toBn(r.value).div(10000).toString(),
			}
		})
	}
	return []
}
