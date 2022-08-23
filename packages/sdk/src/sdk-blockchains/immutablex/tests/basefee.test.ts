import { ImxOrderService } from "../order"
import { createApisSdk } from "../../../common/apis"
import { calcBuyerBaseFee } from "../common/utils"

describe("IMX base fee calc test", () => {
	const apis = createApisSdk("testnet")
	const orderService = new ImxOrderService(null as any, apis)

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
})
