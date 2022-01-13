import type { BlockchainWallet, WalletByBlockchain } from "@rarible/sdk-wallet"
import type { ContractAddress } from "@rarible/types"
import { toContractAddress } from "@rarible/types"
import type { Maybe } from "@rarible/types/build/maybe"
import type { IApisSdk, IRaribleSdk } from "./domain"
import { getSdkConfig } from "./config"
import type { ISell, ISellInternal } from "./types/order/sell/domain"
import type { OrderRequest } from "./types/order/common"
import type { IMint, MintResponse } from "./types/nft/mint/domain"
import type { IMintAndSell, MintAndSellRequest, MintAndSellResponse } from "./types/nft/mint-and-sell/domain"
import type { HasCollection, HasCollectionId } from "./types/nft/mint/prepare-mint-request.type"
import type { RaribleSdkEnvironment } from "./config/domain"
import { createEthereumSdk } from "./sdk-blockchains/ethereum"
import { createFlowSdk } from "./sdk-blockchains/flow"
import { createTezosSdk } from "./sdk-blockchains/tezos"
import { createUnionSdk } from "./sdk-blockchains/union"
import { createApisSdk } from "./common/apis"
import { Middlewarer } from "./common/middleware/middleware"
import { logError, logRequest } from "./common/logger/logger-middleware"
import type { IRaribleInternalSdk, IRaribleSdkConfig } from "./domain"

export function createRaribleSdk(
	wallet: Maybe<BlockchainWallet>,
	env: RaribleSdkEnvironment,
	config?: IRaribleSdkConfig
): IRaribleSdk {
	const blockchainConfig = getSdkConfig(env)
	const apis = createApisSdk(env, config?.apiClientParams)
	const instance = createUnionSdk(
		createEthereumSdk(filterWallet(wallet, "ETHEREUM"), apis, blockchainConfig.ethereumEnv, config?.apiClientParams),
		createFlowSdk(filterWallet(wallet, "FLOW"), apis, blockchainConfig.flowEnv),
		createTezosSdk(filterWallet(wallet, "TEZOS"), apis, blockchainConfig.tezosNetwork),
		createEthereumSdk(filterWallet(wallet, "ETHEREUM"), apis, blockchainConfig.polygonNetwork, config?.apiClientParams),
	)

	setupMiddleware(apis, instance, config)

	return {
		...instance,
		nft: {
			...instance.nft,
			mintAndSell: createMintAndSell(instance.nft.mint, instance.order.sell),
		},
		order: {
			...instance.order,
			sell: createSell(instance.order.sell, apis),
		},
		apis,
	}
}

/**
 * Create middleware controller & wrap methods
 */
function setupMiddleware(apis: IApisSdk, internalSdk: IRaribleInternalSdk, config?: IRaribleSdkConfig) {
	if (config?.logs?.level === undefined || config?.logs?.level === "disabled") {
		return
	}

	const middlewarer = new Middlewarer()

	switch (config?.logs?.level) {
		case "debug":
			middlewarer.use(logRequest)
			break
		case "errors":
			middlewarer.use(logRequest)
			middlewarer.use(logError)
			break
	}

	for (const prop in apis) {
		//@ts-ignore
		middlewarer.wrapObjectMethods(apis[prop], { namespace: "apis." + prop })
	}

	for (const prop in internalSdk) {
		//@ts-ignore
		middlewarer.wrapObjectMethods(internalSdk[prop], { namespace: prop })
	}
}

function filterWallet<T extends "FLOW" | "ETHEREUM" | "TEZOS">(
	wallet: Maybe<BlockchainWallet>,
	blockchain: T
): Maybe<WalletByBlockchain[T]> {
	if (wallet?.blockchain === blockchain) {
		return wallet as WalletByBlockchain[T]
	}
	return undefined
}

function createSell(sell: ISellInternal, apis: IApisSdk): ISell {
	return async ({ itemId }) => {
		const item = await apis.item.getItemById({ itemId })
		const collectionId = toContractAddress(item.contract)
		const response = await sell({ collectionId })
		return {
			...response,
			maxAmount: item.supply,
			submit: response.submit
				.before((input: OrderRequest) => ({
					itemId,
					...input,
				})),
		}
	}
}

function createMintAndSell(mint: IMint, sell: ISellInternal): IMintAndSell {
	return async request => {
		const mintResponse = await mint(request)
		const collectionId = getCollectionId(request)
		const sellResponse = await sell({ collectionId })

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

export function getCollectionId(req: HasCollectionId | HasCollection): ContractAddress {
	if ("collection" in req) {
		return req.collection.id
	}
	return req.collectionId
}

type MiddleMintType = {
	initial: MintAndSellRequest
	mintResponse: MintResponse
}
