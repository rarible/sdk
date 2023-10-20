import type { ItemId } from "@rarible/api-client"
import type { IApisSdk } from "../domain"

export const checkRoyalties = async (itemId: ItemId, apis: IApisSdk) => {
	const { royalties } = await apis.item.getItemRoyaltiesById({ itemId })
	const royaltiesAmount = royalties.reduce((acc, { value }) => acc + value, 0)

	if (royaltiesAmount > 5000) {
		throw new Error("Cannot create order for item with royalties more than 50%")
	}
}
