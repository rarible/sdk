import type { ContractAddress, Maybe } from "@rarible/types"
import type { CollectionId } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { BlockchainWallet, WalletByBlockchain } from "@rarible/sdk-wallet"
import { WalletType } from "@rarible/sdk-wallet"
import { getRandomId } from "@rarible/utils"
import type { RaribleSdkProvider } from "@rarible/sdk-wallet/build/get-wallet"
import { getRaribleWallet } from "@rarible/sdk-wallet/build/get-wallet"
import type { AbstractLogger } from "@rarible/logger/build/domain"
import type { SupportedBlockchain } from "@rarible/sdk-common"
import { isSupportedBlockchain } from "@rarible/sdk-common"
import type { IApisSdk, IRaribleInternalSdk, IRaribleSdk, IRaribleSdkConfig, ISdkContext } from "./domain"
import { LogsLevel } from "./domain"
import { getSdkConfig } from "./config"
import type { ISell, ISellInternal } from "./types/order/sell"
import type { OrderRequest } from "./types/order/common"
import type { MintResponse, OnChainMintResponse } from "./types/nft/mint/prepare"
import { MintType } from "./types/nft/mint/prepare"
import type { IMint } from "./types/nft/mint"
import type { IMintAndSell } from "./types/nft/mint-and-sell"
import type { MintAndSellRequest, MintAndSellResponse } from "./types/nft/mint-and-sell/domain"
import type { HasCollection, HasCollectionId } from "./types/nft/mint/prepare-mint-request.type"
import type { RaribleSdkEnvironment } from "./config/domain"
import { createEthereumSdk } from "./sdk-blockchains/ethereum"
import { createTezosSdk } from "./sdk-blockchains/tezos"
import { createUnionSdk } from "./sdk-blockchains/union"
import { createApisSdk } from "./common/apis"
import { Middlewarer } from "./common/middleware/middleware"
import { getInternalLoggerMiddleware } from "./common/logger/logger-middleware"
import { createSolanaSdk } from "./sdk-blockchains/solana"
import { createImmutablexSdk } from "./sdk-blockchains/immutablex"
import { MethodWithPrepare } from "./types/common"
import { extractBlockchain } from "./common/extract-blockchain"
import { getSdkContext } from "./common/get-sdk-context"
import { createFlowSdk } from "./sdk-blockchains/flow"
import { checkRoyalties } from "./common/check-royalties"
import { getCollectionFromItemId } from "./common/utils"
import { createAptosSdk } from "./sdk-blockchains/aptos"

/**
 * @module
 */

/**
 * Rarible sdk creation function
 *
 * @param provider undefined or BlockchainWallet
 * wallet can instantiate from @rarible/sdk-wallet package
 * @param env the environment that the sdk will interact with.
 * @param [config] config
 * @returns {IRaribleSdk} {@link IRaribleSdk}
 *
 * @example
 * ```typescript
 *    const web3 = new Web3(provider)
 *    const sdk = createRaribleSdk(web3, "prod")
 * ```
 */
export function createRaribleSdk(
	provider: Maybe<RaribleSdkProvider>,
	env: RaribleSdkEnvironment,
	config?: IRaribleSdkConfig
): IRaribleSdk {
	const wallet = provider && getRaribleWallet(provider)
	const sessionId = getRandomId("union")
	const blockchainConfig = getSdkConfig(env)
	const apis = createApisSdk(
		env,
		{
			...(config?.apiClientParams || {}),
			apiKey: config?.apiKey,
		},
		config?.logs)

	const ethConfig = {
		...config?.blockchain?.ETHEREUM,
		params: config?.apiClientParams,
		logs: config?.logs ? { level: config?.logs, session: sessionId } : { level: LogsLevel.TRACE, session: sessionId },
		apiKey: config?.apiKey,
	}
	const instance = createUnionSdk(
		createEthereumSdk(
			filterWallet(wallet, WalletType.ETHEREUM),
			apis,
			Blockchain.ETHEREUM,
			blockchainConfig.ethereumEnv,
			ethConfig
		),
		createFlowSdk(
			filterWallet(wallet, WalletType.FLOW),
			apis,
			blockchainConfig.flowEnv,
			undefined,
			config
		),
		createTezosSdk(
			filterWallet(wallet, WalletType.TEZOS),
			apis,
			blockchainConfig,
			config,
		),
		createSolanaSdk(
			filterWallet(wallet, WalletType.SOLANA),
			apis,
			blockchainConfig.solanaNetwork,
			config?.blockchain?.SOLANA
		),
		createSolanaSdk(
			filterWallet(wallet, WalletType.SOLANA),
			apis,
			blockchainConfig.solanaNetwork,
			config?.blockchain?.SOLANA
		),
		createImmutablexSdk(
			filterWallet(wallet, WalletType.IMMUTABLEX),
			apis,
			blockchainConfig.immutablexNetwork,
			config?.logs
		),
		createAptosSdk(
			filterWallet(wallet, WalletType.APTOS),
			apis,
			blockchainConfig.aptosNetwork,
			config?.blockchain?.APTOS
		),
	)

	const sdkContext: ISdkContext = {
		wallet,
		env,
		config,
		sessionId,
		apiKey: config?.apiKey,
		providerId: config?.context?.providerId,
		providerMeta: config?.context?.providerMeta,
	}
	setupMiddleware({
		apis,
		internalSdk: instance,
		sdkContext,
		externalLogger: config?.logger,
	})

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
		getSdkContext: getSdkContext.bind(null, sdkContext),
	}
}

export type SetupMiddlewareData = {
	apis: IApisSdk
	internalSdk: IRaribleInternalSdk
	sdkContext: ISdkContext
	externalLogger?: AbstractLogger
}
/**
 * Create middleware controller & wrap methods
 */
function setupMiddleware({ apis, internalSdk, sdkContext, externalLogger }: SetupMiddlewareData) {
	const middlewarer = new Middlewarer()

	if (sdkContext.config?.logs !== LogsLevel.DISABLED) {
		middlewarer.use(
			getInternalLoggerMiddleware(
				sdkContext.config?.logs ?? LogsLevel.TRACE,
				sdkContext,
				externalLogger,
			)
		)
	}

	for (const middleware of (sdkContext.config?.middlewares ?? [])) {
		middlewarer.use(middleware)
	}

	for (const prop in apis) {
		//@ts-ignore
		//todo: better wrap for apis methods
		middlewarer.wrapApiControllerMethods(apis[prop], { namespace: "apis." + prop })
	}

	for (const prop in internalSdk) {
		//@ts-ignore
		middlewarer.wrapObjectMethods(internalSdk[prop], { namespace: prop })
	}
}

function filterWallet<T extends WalletType>(
	wallet: Maybe<BlockchainWallet>,
	blockchainType: T
): Maybe<WalletByBlockchain[T]> {
	if (wallet?.walletType === blockchainType) {
		return wallet as WalletByBlockchain[T]
	}
	return undefined
}

function createSell(sell: ISellInternal, apis: IApisSdk): ISell {
	return new MethodWithPrepare(
		 (request) => sell(request),
		async (request) => {
			const [item, collection] = await Promise.all([
				apis.item.getItemById({ itemId: request.itemId }),
				apis.collection.getCollectionById({ collection: getCollectionFromItemId(request.itemId) }),
			])

			if (collection.self) {
				await checkRoyalties(request.itemId, apis)
			}

			const response = await sell.prepare({ ...request, blockchain: extractBlockchain(request.itemId) })
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
	)
}

function createMintAndSell(mint: IMint, sell: ISellInternal): IMintAndSell {
	// @ts-expect-error
	return new MethodWithPrepare(
		async (request: any) => {
			const mintResponse = await mint(request)
			if (mintResponse.type === MintType.ON_CHAIN) {
				await (mintResponse as OnChainMintResponse).transaction.wait()
			}
			const { supply, ...restRequest } = request
			const orderId = await sell({
				...restRequest,
				amount: supply,
				itemId: mintResponse.itemId,
			})
			return {
				...mintResponse,
				orderId,
			}
		},
		async (request) => {
    	const mintResponse = await mint.prepare(request)
    	const collectionId = getCollectionId(request)
    	const blockchain = getBlockchainCollectionId(collectionId)
    	const sellResponse = await sell.prepare({ blockchain })

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
		})
}

/**
 * @internal
 */
export function getCollectionId(req: HasCollectionId | HasCollection): CollectionId {
	if ("collection" in req) {
		return req.collection.id
	}
	return req.collectionId
}

function getBlockchainCollectionId(contract: ContractAddress | CollectionId): SupportedBlockchain {
	const [blockchain] = contract.split(":")
	if (!isSupportedBlockchain(blockchain)) {
		throw new Error(`Unrecognized blockchain in contract ${contract}`)
	}
	return blockchain as SupportedBlockchain
}

type MiddleMintType = {
	initial: MintAndSellRequest
	mintResponse: MintResponse
}

export { WalletType }
export { getSimpleFlowFungibleBalance } from "./sdk-blockchains/flow/balance-simple"
export { IRaribleSdk, MintAndSellRequest }
export { RequestCurrency, RequestCurrencyAssetType } from "./common/domain"
export { UnionPart } from "./types/order/common/index"
export { UploadMetaResponse } from "./sdk-blockchains/union/meta/domain"
