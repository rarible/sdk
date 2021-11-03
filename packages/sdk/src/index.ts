import type { BlockchainWallet } from "@rarible/sdk-wallet"
import {
	ActivityControllerApi,
	CollectionControllerApi,
	Configuration,
	ItemControllerApi,
	OrderControllerApi,
	OwnershipControllerApi,
} from "@rarible/api-client"
import { toUnionAddress, UnionAddress } from "@rarible/types"
import type { IApisSdk, IRaribleSdk } from "./domain"
import { getSDKBlockchainInstance } from "./sdk-blockchains"
import { CONFIGS } from "./config"
import { ISell, ISellInternal } from "./types/order/sell/domain"
import { OrderRequest } from "./types/order/common"
import { IMint, MintResponse } from "./types/nft/mint/domain"
import { IMintAndSell, MintAndSellRequest, MintAndSellResponse } from "./types/nft/mint-and-sell/domain"
import { HasCollection, HasCollectionId } from "./types/nft/mint/prepare-mint-request.type"

export function createRaribleSdk(wallet: BlockchainWallet, env: keyof typeof CONFIGS): IRaribleSdk {
	const config = CONFIGS[env]
	const configuration = new Configuration({ basePath: config.basePath })
	const apis = {
		collection: new CollectionControllerApi(configuration),
		item: new ItemControllerApi(configuration),
		ownership: new OwnershipControllerApi(configuration),
		order: new OrderControllerApi(configuration),
		activity: new ActivityControllerApi(configuration),
	}
	const instance = getSDKBlockchainInstance(wallet, apis, config)
	const sell = createSell(instance.order.sell, apis)
	const mintAndSell = createMintAndSell(instance.nft.mint, instance.order.sell)
	const nft = {
		...instance.nft,
		mintAndSell,
	}
	const order = {
		...instance.order,
		sell,
	}
	return {
		...instance,
		nft,
		order,
		apis,
	}
}

function createSell(sell: ISellInternal, apis: IApisSdk): ISell {
	return async request => {
		const item = await apis.item.getItemById({ itemId: request.itemId })
		const internalResponse = await sell({ collectionId: toUnionAddress(item.collection) })
		const submit = internalResponse.submit
			.before((input: OrderRequest) => {
				return {
					itemId: request.itemId,
					...input,
				}
			})
		return {
			...internalResponse,
			maxAmount: item.supply,
			submit,
		}
	}
}

function createMintAndSell(mint: IMint, sell: ISellInternal): IMintAndSell {
	return async request => {
		const mintResponse = await mint(request)
		const sellResponse = await sell({ collectionId: getCollectionId(request) })

		const mintAction = mintResponse.submit
			.around(
				(input: MintAndSellRequest) => ({ ...input }),
				(mintResponse, initial): MiddleMintType => ({ initial, mintResponse })
			)

		const sellAction = sellResponse.submit
			.around(
				({ initial, mintResponse }: MiddleMintType) => ({
					...initial,
					itemId: mintResponse.itemId,
					amount: initial.supply,
				}),
				(orderId, { mintResponse }): MintAndSellResponse => ({
					...mintResponse,
					orderId,
				})
			)

		return {
			...mintResponse,
			...sellResponse,
			submit: mintAction.thenAction(sellAction),
		}
	}
}

function getCollectionId(req: HasCollectionId | HasCollection): UnionAddress {
	if ("collection" in req) {
		return req.collection.id
	} else {
		return req.collectionId
	}
}

type MiddleMintType = {
	initial: MintAndSellRequest
	mintResponse: MintResponse
}
