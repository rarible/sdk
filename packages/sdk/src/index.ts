import type { BlockchainWallet } from "@rarible/sdk-wallet"
import * as ApiClient from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toUnionAddress } from "@rarible/types"
import type { Maybe } from "@rarible/types/build/maybe"
import type { IApisSdk, IRaribleSdk } from "./domain"
import { getSdkConfig } from "./config"
import type { ISell, ISellInternal } from "./types/order/sell/domain"
import type { OrderRequest } from "./types/order/common"
import type { IMint, MintResponse } from "./types/nft/mint/domain"
import type { IMintAndSell, MintAndSellRequest, MintAndSellResponse } from "./types/nft/mint-and-sell/domain"
import type { HasCollection, HasCollectionId } from "./types/nft/mint/prepare-mint-request.type"
import type { RaribleSdkConfig, RaribleSdkEnvironment } from "./config/domain"
import { createEthereumSdk } from "./sdk-blockchains/ethereum"
import { createFlowSdk } from "./sdk-blockchains/flow"
import { createTezosSdk } from "./sdk-blockchains/tezos"
import { createUnionSdk } from "./sdk-blockchains/union"

export function createRaribleSdk(wallet: Maybe<BlockchainWallet>, env: RaribleSdkEnvironment): IRaribleSdk {
	const config = getSdkConfig(env)
	const apis = createApisSdk(config)
	const ethereum = createEthereumSdk(wallet?.blockchain === "ETHEREUM" ? wallet : undefined, apis, config.ethereumEnv)
	const flow = createFlowSdk(wallet?.blockchain === "FLOW" ? wallet : undefined, apis, config.flowEnv)
	const tezos = createTezosSdk(wallet?.blockchain === "TEZOS" ? wallet : undefined)
	const instance = createUnionSdk(ethereum, flow, tezos)
	const sell = createSell(instance.order.sell, apis)
	const mintAndSell = createMintAndSell(instance.nft.mint, instance.order.sell)

	return {
		...instance,
		nft: {
			...instance.nft,
			mintAndSell,
		},
		order: {
			...instance.order,
			sell,
		},
		apis,
	}
}

function createApisSdk(config: RaribleSdkConfig): IApisSdk {
	const configuration = new ApiClient.Configuration({
		basePath: config.basePath,
	})
	return {
		collection: new ApiClient.CollectionControllerApi(configuration),
		item: new ApiClient.ItemControllerApi(configuration),
		ownership: new ApiClient.OwnershipControllerApi(configuration),
		order: new ApiClient.OrderControllerApi(configuration),
		activity: new ApiClient.ActivityControllerApi(configuration),
	}
}

function createSell(sell: ISellInternal, apis: IApisSdk): ISell {
	return async request => {
		const item = await apis.item.getItemById({ itemId: request.itemId })
		const response = await sell({
			collectionId: toUnionAddress(item.collection),
		})
		return {
			...response,
			maxAmount: item.supply,
			submit: response.submit
				.before((input: OrderRequest) => ({
					itemId: request.itemId,
					...input,
				})),
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

export function getCollectionId(req: HasCollectionId | HasCollection): UnionAddress {
	if ("collection" in req) {
		return req.collection.id
	}
	return req.collectionId
}

type MiddleMintType = {
	initial: MintAndSellRequest
	mintResponse: MintResponse
}
