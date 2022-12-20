import { toItemId } from "@rarible/types"
import { ImxOrderService } from "../order"
import { createApisSdk } from "../../../common/apis"
import { calcBuyerBaseFee } from "../common/utils"
import { OriginFeeSupport } from "../../../types/order/fill/domain"
import { createRaribleSdk } from "../../../index"

describe("IMX base fee calc test", () => {
	const apis = createApisSdk("testnet")
	const orderService = new ImxOrderService(null as any, apis)
	const sdk = createRaribleSdk(undefined, "development")

	test("baseFee for sell", async () => {
		const prep = await orderService.sell()
		expect(prep.baseFee).toEqual(200) // const fee
	})

	test("baseFee for buy", async () => {
		expect(calcBuyerBaseFee(
			await apis.order.getOrderById({
				id: "IMMUTABLEX:145293",
			})),
		).toEqual(950)
	})

	test("get future order fees", async () => {
		const fees = await sdk.restriction.getFutureOrderFees(
			toItemId("IMMUTABLEX:0xacb3c6a43d15b907e8433077b6d38ae40936fe2c")
		)
		expect(fees.originFeeSupport).toBe(OriginFeeSupport.FULL)
		expect(fees.baseFee).toBe(200)
	})
})
