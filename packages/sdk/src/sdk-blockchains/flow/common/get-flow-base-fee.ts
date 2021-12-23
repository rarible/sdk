import type { FlowSdk } from "@rarible/flow-sdk"

export function getFlowBaseFee(sdk: FlowSdk): number {
	return parseInt(sdk.order.getProtocolFee().sellerFee.value)
}
