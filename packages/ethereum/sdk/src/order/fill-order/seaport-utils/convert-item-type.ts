import { SeaportItemType } from "@rarible/ethereum-api-client/build/models/SeaportItemType"
import { ItemType } from "./constants"

export function convertItemType(type: SeaportItemType): ItemType {
	switch (type) {
		case SeaportItemType.NATIVE: return ItemType.NATIVE
		case SeaportItemType.ERC20: return ItemType.ERC20
		case SeaportItemType.ERC721: return ItemType.ERC721
		case SeaportItemType.ERC721_WITH_CRITERIA: return ItemType.ERC721_WITH_CRITERIA
		case SeaportItemType.ERC1155: return ItemType.ERC1155
		case SeaportItemType.ERC1155_WITH_CRITERIA: return ItemType.ERC1155_WITH_CRITERIA
		default: throw new Error(`Unrecognized item type=${type}`)
	}
}
