import { createRaribleSdk } from "../index"
import { LogsLevel } from "../types"

describe("api keys", () => {
	test("get item without API key should be succeed", async () => {
		const sdk = createRaribleSdk(undefined, "dev-ethereum", {
			logs: {
				level: LogsLevel.DISABLED,
			},
		})
		await sdk.apis.nftItem.getNftItemById({
			itemId: "0x64f088254d7ede5dd6208639aabf3614c80d396d:53721905486644660545161939638297855196812841812653174796223513003283747701450",
		})
	})

	test("get item with valid API key should be succeed", async () => {
		const sdk = createRaribleSdk(undefined, "dev-ethereum", {
			logs: {
				level: LogsLevel.DISABLED,
			},
			apiKey: "eb0e4c76-b662-4c3d-8121-3643a7eb75bb",
		})
		await sdk.apis.nftItem.getNftItemById({
			itemId: "0x64f088254d7ede5dd6208639aabf3614c80d396d:53721905486644660545161939638297855196812841812653174796223513003283747701450",
		})
	})

	test("get item with invalid API key should be failed", async () => {
		const sdk = createRaribleSdk(undefined, "dev-ethereum", {
			logs: {
				level: LogsLevel.DISABLED,
			},
			apiKey: "eb0e4c76-b662-4c3d-8121-3643a7eb75ba",
		})
		let responseError
		try {
			await sdk.apis.nftItem.getNftItemById({
				itemId: "0x64f088254d7ede5dd6208639aabf3614c80d396d:53721905486644660545161939638297855196812841812653174796223513003283747701450",
			})
		} catch (e: any) {
			responseError = await e.json()
		}
		expect(responseError.status).toBe(403)
		expect(responseError.message).toBe("API key not found")
	})

	test("throw custom error on getValidatedOrderByHash method", async () => {
		const sdk = createRaribleSdk(undefined, "mainnet", {
			logs: {
				level: LogsLevel.DISABLED,
			},
			apiKey: process.env.SDK_API_KEY_PROD || undefined,
		})
		let responseError
		try {
			await sdk.apis.order.getValidatedOrderByHash({
				hash: "0xa7dade8642acc83dc60d50bef30af7f2951cd454e1c35cdc71a14db6452759e5",
			})
		} catch (e: any) {
			responseError = e
		}
		expect(responseError?.status).toBe(undefined)
		expect(responseError?.value?.code).toBe("VALIDATION")
	})
})
