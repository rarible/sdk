import type { ItemId } from "@rarible/api-client"
import { checkRoyalties } from "./check-royalties"

describe("check royalties", () => {
	const itemId = "ETHEREUM:0x123" as ItemId
	const mockApis = {
		item: {
			getItemRoyaltiesById: () => {},
		},
	} as any

	test("should pass when royalties non specified", async () => {
		mockApis.item.getItemRoyaltiesById = jest.fn().mockResolvedValue({ royalties: [] })

		expect(await checkRoyalties(itemId, mockApis)).toBeUndefined()
	})

	test("should pass when royalties less than 50%", async () => {
		mockApis.item.getItemRoyaltiesById = jest.fn().mockResolvedValue({ royalties: [{ value: 4999 }] })

		expect(await checkRoyalties(itemId, mockApis)).toBeUndefined()
	})

	test("should throw error when royalties more than 50%", async () => {
		mockApis.item.getItemRoyaltiesById = jest.fn().mockResolvedValue({ royalties: [{ value: 5001 }] })

		await expect(checkRoyalties(itemId, mockApis)).rejects.toThrow("Cannot create order for item with royalties more than 50%")
	})
})
