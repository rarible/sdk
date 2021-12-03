import type { ContractAddress, ItemId, UnionAddress } from "@rarible/types"

export type CanTransferResult = {
	success: true
} | {
	success: false
	reason: string
}

export enum ItemActionType {
	BURN = "BURN",
	TRANSFER = "TRANSFER",
	SELL = "SELL",
	BID = "BID",
}
export enum CollectionActionType {
	DEPLOY = "DEPLOY",
	MINT = "MINT",
}
// export enum OrderActionType {
//CANCEL = "CANCEL",
//FILL = "FILL",
// }


export type IRestrictionSdk = {
	items: {
		//get all common items actions
		getActions: () => ItemActionType[],
		//particular actions with arguments
		canTransfer: (
			itemId: ItemId, from: UnionAddress, to: UnionAddress,
		) => Promise<CanTransferResult>
		// canBurn,
	}
	collections: {
		//get all common collection actions
		getActions: () => CollectionActionType[],
		canMint: (collectionId: ContractAddress) => boolean
	}
	// orders: {
	// getActions: () => OrderActionType[],
	// canCancel: () => boolean
	// canFill: () => boolean
	// }
}
