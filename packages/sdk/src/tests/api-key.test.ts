import { toItemId } from "@rarible/types"
import { createRaribleSdk } from "../index"
import { LogsLevel } from "../domain"

describe("server api keys", () => {
	test.concurrent("get item without API key should be succeed", async () => {
		const sdk = createRaribleSdk(undefined, "development", {
			logs: LogsLevel.DISABLED,
		})

		await sdk.apis.item.getItemById({
			itemId: toItemId("ETHEREUM:0x6972347e66a32f40ef3c012615c13cb88bf681cc:53721905486644660545161939638297855196812841812653174796223513003283747704177"),
		})
	})

	test.concurrent("get item with valid API key should be succeed", async () => {
		const sdk = createRaribleSdk(undefined, "development", {
			logs: LogsLevel.DISABLED,
			apiKey: "eb0e4c76-b662-4c3d-8121-3643a7eb75bb",
		})

		await sdk.apis.item.getItemById({
			itemId: toItemId("ETHEREUM:0x6972347e66a32f40ef3c012615c13cb88bf681cc:53721905486644660545161939638297855196812841812653174796223513003283747704177"),
		})
	})

	test.concurrent("get item with invalid API key should be failed", async () => {
		const sdk = createRaribleSdk(undefined, "development", {
			logs: LogsLevel.DISABLED,
			apiKey: "eb0e4c76-b662-4c3d-8121-3643a7eb75ba",
		})

		let responseError
		try {
			await sdk.apis.item.getItemById({
				itemId: toItemId("ETHEREUM:0x6972347e66a32f40ef3c012615c13cb88bf681cc:53721905486644660545161939638297855196812841812653174796223513003283747704177"),
			})
		} catch (e: any) {
			responseError = await e.json()
		}
		expect(responseError.status).toBe(403)
		expect(responseError.message).toBe("API key not found")
	})
})
