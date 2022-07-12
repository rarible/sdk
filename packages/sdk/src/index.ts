import type { ContractAddress } from "@rarible/types"
import type { Maybe } from "@rarible/types/build/maybe"
import type { CollectionId } from "@rarible/api-client"
import { Blockchain, BlockchainGroup } from "@rarible/api-client"
import type { BlockchainWallet, WalletByBlockchain } from "@rarible/sdk-wallet"
import type { IApisSdk, IRaribleInternalSdk, IRaribleSdk, IRaribleSdkConfig, ISdkContext } from "./domain"
import { LogsLevel } from "./domain"
import { getSdkConfig } from "./config"
import type { ISell, ISellInternal } from "./types/order/sell/domain"
import type { OrderRequest } from "./types/order/common"
import type { IMint, MintResponse } from "./types/nft/mint/domain"
import { MintType } from "./types/nft/mint/domain"
import type { IMintAndSell, MintAndSellRequest, MintAndSellResponse } from "./types/nft/mint-and-sell/domain"
import type { HasCollection, HasCollectionId } from "./types/nft/mint/prepare-mint-request.type"
import type { RaribleSdkEnvironment } from "./config/domain"
import { createEthereumSdk } from "./sdk-blockchains/ethereum"
import { createFlowSdk } from "./sdk-blockchains/flow"
import { createTezosSdk } from "./sdk-blockchains/tezos"
import { createUnionSdk } from "./sdk-blockchains/union"
import { createApisSdk } from "./common/apis"
import { Middlewarer } from "./common/middleware/middleware"
import { getInternalLoggerMiddleware } from "./common/logger/logger-middleware"
import { createSolanaSdk } from "./sdk-blockchains/solana"
import { createImmutablexSdkBlank } from "./sdk-blockchains/immutablex"

export function createRaribleSdk(
	wallet: Maybe<BlockchainWallet>,
	env: RaribleSdkEnvironment,
	config?: IRaribleSdkConfig
): IRaribleSdk {
	const blockchainConfig = getSdkConfig(env)
	const apis = createApisSdk(env, config?.apiClientParams)

	const ethConfig = {
		...config?.blockchain?.ETHEREUM,
		params: config?.apiClientParams,
		logs: config?.logs ?? LogsLevel.TRACE,
	}
	const instance = createUnionSdk(
		createEthereumSdk(
			filterWallet(wallet, BlockchainGroup.ETHEREUM),
			apis,
			Blockchain.ETHEREUM,
			blockchainConfig.ethereumEnv,
			ethConfig
		),
		createFlowSdk(
			filterWallet(wallet, BlockchainGroup.FLOW),
			apis,
			blockchainConfig.flowEnv,
			undefined,
			config?.blockchain?.FLOW?.auth
		),
		createTezosSdk(
			filterWallet(wallet, BlockchainGroup.TEZOS),
			apis,
			blockchainConfig
		),
		createEthereumSdk(
			filterWallet(wallet, BlockchainGroup.ETHEREUM),
			apis,
			Blockchain.POLYGON,
			blockchainConfig.polygonNetwork,
			ethConfig
		),
		createSolanaSdk(
			filterWallet(wallet, BlockchainGroup.SOLANA),
			apis,
			blockchainConfig.solanaNetwork,
			config?.blockchain?.SOLANA
		),
		createImmutablexSdkBlank()
	)

	setupMiddleware(apis, instance, { wallet, env, config })

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
		wallet,
	}
}

/**
 * Create middleware controller & wrap methods
 */
function setupMiddleware(
	apis: IApisSdk,
	internalSdk: IRaribleInternalSdk,
	sdkContext: ISdkContext
) {
	const middlewarer = new Middlewarer()

	if (sdkContext.config?.logs !== LogsLevel.DISABLED) {
		middlewarer.use(getInternalLoggerMiddleware(
			sdkContext.config?.logs ?? LogsLevel.TRACE,
			sdkContext
		))
	}

	for (const middleware of (sdkContext.config?.middlewares ?? [])) {
		middlewarer.use(middleware)
	}

	for (const prop in apis) {
		//@ts-ignore
		//todo: better wrap for apis methods
		middlewarer.wrapObjectMethods(apis[prop], { namespace: "apis." + prop })
	}

	for (const prop in internalSdk) {
		//@ts-ignore
		middlewarer.wrapObjectMethods(internalSdk[prop], { namespace: prop })
	}
}

function filterWallet<T extends BlockchainGroup>(
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
		const response = await sell({ blockchain: item.blockchain })
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
		const blockchain = getBlockchainCollectionId(collectionId)
		const sellResponse = await sell({ blockchain })

		const mintAction = mintResponse.submit
			.around(
				(input: MintAndSellRequest) => ({ ...input }),
				async (mintResponse, initial): Promise<MiddleMintType> => {
					if (mintResponse.type === MintType.ON_CHAIN) {
						await mintResponse.transaction.wait()
					}
					return { initial, mintResponse }
				}
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

export function getCollectionId(req: HasCollectionId | HasCollection): CollectionId {
	if ("collection" in req) {
		return req.collection.id
	}
	return req.collectionId
}

function getBlockchainCollectionId(contract: ContractAddress | CollectionId): Blockchain {
	const [blockchain] = contract.split(":")
	if (!(blockchain in Blockchain)) {
		throw new Error(`Unrecognized blockchain in contract ${contract}`)
	}
	return blockchain as Blockchain
}

type MiddleMintType = {
	initial: MintAndSellRequest
	mintResponse: MintResponse
}

export { getSimpleFlowFungibleBalance } from "./sdk-blockchains/flow/balance-simple"
export { IRaribleSdk, MintAndSellRequest }
export { RequestCurrency } from "./common/domain"
export { UnionPart } from "./types/order/common/index"
export { isEVMBlockchain } from "./sdk-blockchains/ethereum/common"
