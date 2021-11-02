import { ItemId } from "@rarible/api-client"

export function getTezosItemData(itemId: ItemId) {
	const [domain, contract, tokenId] = itemId.split(":")
	if (domain !== "TEZOS") {
		throw new Error(`Not an ethereum item: ${itemId}`)
	}
	return {
		itemId: `${contract}:${tokenId}`,
		contract,
		tokenId,
		domain,
	}
}
