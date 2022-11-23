import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { Address, AssetType, OrderForm } from "@rarible/ethereum-api-client"
import type { BigNumber } from "@rarible/types"
import type { Maybe } from "@rarible/types/build/maybe"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import type { AmmTradeInfo } from "@rarible/ethereum-api-client/build/models"
import type { GetAmmBuyInfoRequest } from "@rarible/ethereum-api-client/build/apis/OrderControllerApi"
import { toWord } from "@rarible/types"
import { getEthereumConfig } from "./config"
import type { UpsertOrderAction } from "./order/upsert-order"
import { UpsertOrder } from "./order/upsert-order"
import { approve as approveTemplate } from "./order/approve"
import type { SellOrderAction, SellOrderUpdateAction } from "./order/sell"
import { OrderSell } from "./order/sell"
import { signOrder as signOrderTemplate } from "./order/sign-order"
import type { BidOrderAction, BidUpdateOrderAction } from "./order/bid"
import { OrderBid } from "./order/bid"
import * as order from "./order"
import { checkAssetType as checkAssetTypeTemplate } from "./order/check-asset-type"
import type { MintOffChainResponse, MintOnChainResponse, MintRequest } from "./nft/mint"
import { mint as mintTemplate } from "./nft/mint"
import type { TransferAsset } from "./nft/transfer"
import { transfer as transferTemplate } from "./nft/transfer"
import { signNft as signNftTemplate } from "./nft/sign-nft"
import type { BurnRequest } from "./nft/burn"
import { burn as burnTemplate } from "./nft/burn"
import type { RaribleEthereumApis } from "./common/apis"
import { createEthereumApis } from "./common/apis"
import { getSendWithInjects } from "./common/send-transaction"
import { cancel as cancelTemplate } from "./order/cancel"
import type {
	FillBatchOrderAction,
	FillOrderAction,
	GetOrderBuyTxData,
	GetOrderFillTxData,
} from "./order/fill-order/types"
import type { SimpleOrder } from "./order/types"
import { OrderFiller } from "./order/fill-order"
import { getBaseFee } from "./common/get-base-fee"
import { DeployErc721 } from "./nft/deploy-erc721"
import { DeployErc1155 } from "./nft/deploy-erc1155"
import type { DeployNft } from "./common/deploy"
import type { BalanceRequestAssetType } from "./common/balances"
import { Balances } from "./common/balances"
import type { EthereumNetwork, IRaribleEthereumSdkConfig } from "./types"
import { LogsLevel } from "./types"
import { ConvertWeth } from "./order/convert-weth"
import { checkChainId } from "./order/check-chain-id"
import type { AuctionStartAction } from "./auction/start"
import { StartAuction } from "./auction/start"
import { cancelAuction } from "./auction/cancel"
import { finishAuction } from "./auction/finish"
import type { PutAuctionBidAction } from "./auction/put-bid"
import { PutAuctionBid } from "./auction/put-bid"
import type { BuyoutAuctionAction } from "./auction/buy-out"
import { BuyoutAuction } from "./auction/buy-out"
import { createRemoteLogger, getEnvironment } from "./common/logger/logger"
import { getAuctionHash } from "./auction/common"
import type { CryptoPunksWrapper } from "./common/crypto-punks"
import { approveForWrapper, unwrapPunk, wrapPunk } from "./nft/cryptopunk-wrapper"
import { BatchOrderFiller } from "./order/fill-order/batch-purchase/batch-purchase"
import { getUpdatedCalldata } from "./order/fill-order/common/get-updated-call"

export interface RaribleOrderSdk {
	/**
	 * Sell asset (create off-chain order and check if approval is needed)
	 */
	sell: SellOrderAction

	/**
	 * Update price in existing sell order (with approval checking)
	 */
	sellUpdate: SellOrderUpdateAction

	/**
	 * Create bid (create off-chain order and check if approval is needed)
	 */
	bid: BidOrderAction

	/**
	 * Update price in existing bid order (with approval checking)
	 */
	bidUpdate: BidUpdateOrderAction

	/**
	 * Fill order (buy or accept bid - depending on the order type)
	 *
	 * @deprecated Use {@link buy} or {@link acceptBid} instead
	 * @param request order and parameters (amount to fill, fees etc)
	 */
	fill: FillOrderAction

	/**
	 * Buy order
	 *
	 * @param request order and parameters (amount to fill, fees etc)
	 */
	buy: FillOrderAction

	/**
	 * Accept bid order
	 *
	 * @param request order and parameters (amount to fill, fees etc)
	 */
	acceptBid: FillOrderAction

	/**
	 * Purchase batch
	 *
	 * @param request array of order and parameters (amount to fill, fees etc)
	 */
	buyBatch: FillBatchOrderAction

	/**
   * Get fill transaction data (for external sending)
   *
   * @param request order and parameters (amount to fill, fees etc)
   */
	getFillTxData: GetOrderFillTxData

	/**
   * Get buy transaction data (for external sending)
   *
   * @param request order and parameters (amount to fill, fees etc)
   */
	getBuyTxData: GetOrderBuyTxData

	/**
	 * Sell or create bid. Low-level method
	 */
	upsert: UpsertOrderAction

	/**
	 * Get base fee (this fee will be hold by the processing platform - in basis points)
	 */
	getBaseOrderFee(type?: OrderForm["type"]): Promise<number>

	/**
	 * Get base fee for filling an order (this fee will be hold by the processing platform - in basis points)
	 */
	getBaseOrderFillFee(order: SimpleOrder): Promise<number>

	/**
	 * Get for buy pricing info from AMM
   *
   * @param request AMM hash with amount of NFTs
   */
	getBuyAmmInfo(request: GetAmmBuyInfoRequest): Promise<AmmTradeInfo>

	/**
	 * Cancel order
	 */
	cancel(order: SimpleOrder): Promise<EthereumTransaction>
}

export interface RaribleNftSdk {
	/**
	 *
	 * @param request parameters for item to mint
	 */
	mint(request: MintRequest): Promise<MintOnChainResponse | MintOffChainResponse>

	/**
	 * @param asset asset for transfer
	 * @param to recipient address
	 * @param amount for transfer
	 */
	transfer(asset: TransferAsset, to: Address, amount?: BigNumber): Promise<EthereumTransaction>

	/**
	 * @param request burn request
	 */
	burn(request: BurnRequest): Promise<EthereumTransaction | void>

	deploy: DeployNft

	cryptoPunks: CryptoPunksWrapper
}

export interface RaribleBalancesSdk {
	/**
	 * Return balance of user
	 * @param address balance owner
	 * @param assetType type of asset. Supports ERC20 and ETH
	 */
	getBalance(address: Address, assetType: BalanceRequestAssetType): Promise<BigNumberValue>

	/**
	 * Convert ETH balance from/to the Wrapped Ether (ERC-20) token
	 * @param from ETH or ERC20 Wrapped Ether asset type
	 * @param to ERC20 Wrapped Ether or ETH asset type
	 * @param value Value to convert
	 */
	convert(from: AssetType, to: AssetType, value: BigNumberValue): Promise<EthereumTransaction>

	/**
	 * Return address of Wrapped Ether contract (ERC-20)
	 */
	getWethContractAddress(): Address
}

export interface RaribleAuctionSdk {
	/**
   * Start new auction
   * @param request start auction request
   */
	start: AuctionStartAction

	/**
   * Cancel started auction
   * @param hash Auction hash
   */
	cancel(hash: string): Promise<EthereumTransaction>

	/**
   * Finish auction with at least one bid
   * @param hash Auction hash
   */
	finish(hash: string): Promise<EthereumTransaction>

	/**
   * Put bid
   * @param request Put bid request
   */
	putBid: PutAuctionBidAction

	/**
   * Buy out auction if it possible
   * @param request Buy out request
   */
	buyOut: BuyoutAuctionAction
	/**
   * Generate hash of auction by id
   * @param auctionId Auction ID
   */
	getHash: (auctionId: BigNumber) => string
}

export interface RaribleSdk {
	order: RaribleOrderSdk
	nft: RaribleNftSdk
	auction: RaribleAuctionSdk
	apis: RaribleEthereumApis
	balances: RaribleBalancesSdk
}

// noinspection JSUnusedGlobalSymbols
export function createRaribleSdk(
	ethereum: Maybe<Ethereum>,
	env: EthereumNetwork,
	sdkConfig?: IRaribleEthereumSdkConfig
): RaribleSdk {
	const config = getEthereumConfig(env)
	const apis = createEthereumApis(env, sdkConfig?.apiClientParams)
	const checkWalletChainId = checkChainId.bind(null, ethereum, config)

	const sendWithInjects = partialCall(getSendWithInjects({
		logger: {
			instance: createRemoteLogger({
				ethereum,
				env: getEnvironment(env),
				sessionId: sdkConfig?.logs?.session,
				apiKey: sdkConfig?.apiKey,
			}),
			level: sdkConfig?.logs?.level ?? LogsLevel.DISABLED,
		},
	}), apis.gateway)

	const send = partialCall(sendWithInjects, checkWalletChainId)
	const checkLazyAssetType = partialCall(order.checkLazyAssetType, apis.nftItem)
	const checkLazyAsset = partialCall(order.checkLazyAsset, checkLazyAssetType)
	const checkLazyOrder = order.checkLazyOrder.bind(null, checkLazyAsset)
	const checkAssetType = partialCall(checkAssetTypeTemplate, apis.nftCollection)

	const getBaseOrderFee = getBaseFee.bind(null, config, env)
	const filler = new OrderFiller(ethereum, send, config, apis, getBaseOrderFee, env, sdkConfig)
	const buyBatchService = new BatchOrderFiller(
		ethereum,
		send,
		config,
		apis,
		getBaseOrderFee,
		env,
		sdkConfig,
	)

	const approveFn = partialCall(approveTemplate, ethereum, send, config.transferProxies)

	const upsertService = new UpsertOrder(
		filler,
		send,
		checkLazyOrder,
		partialCall(approveTemplate, ethereum, send, config.transferProxies),
		partialCall(signOrderTemplate, ethereum, config),
		apis.order,
		ethereum,
		checkWalletChainId,
		toWord(getUpdatedCalldata(sdkConfig))
	)

	const sellService = new OrderSell(upsertService, checkAssetType, checkWalletChainId)
	const bidService = new OrderBid(upsertService, checkAssetType, checkWalletChainId)
	const wethConverter = new ConvertWeth(ethereum, send, config)
	const startAuctionService = new StartAuction(ethereum, send, config, env, approveFn, apis)
	const putAuctionBidService = new PutAuctionBid(ethereum, send, config, env, approveFn, apis)
	const buyOutAuctionService = new BuyoutAuction(ethereum, send, config, env, approveFn, apis)

	return {
		apis,
		order: {
			sell: sellService.sell,
			sellUpdate: sellService.update,
			fill: filler.fill,
			buy: filler.buy,
			buyBatch: buyBatchService.buy,
			acceptBid: filler.acceptBid,
			getFillTxData: filler.getTransactionData,
			getBuyTxData: filler.getBuyTx,
			bid: bidService.bid,
			bidUpdate: bidService.update,
			upsert: upsertService.upsert,
			cancel: partialCall(cancelTemplate, checkLazyOrder, ethereum, send, config.exchange, checkWalletChainId, apis),
			getBaseOrderFee: getBaseOrderFee,
			getBaseOrderFillFee: filler.getBaseOrderFillFee,
			getBuyAmmInfo: filler.getBuyAmmInfo,
		},
		auction: {
			start: startAuctionService.start,
			cancel: cancelAuction.bind(null, ethereum, send, config, apis),
			finish: finishAuction.bind(null, ethereum, send, config, apis),
			putBid: putAuctionBidService.putBid,
			buyOut: buyOutAuctionService.buyout,
			getHash: getAuctionHash.bind(null, ethereum, config),
		},
		nft: {
			mint: partialCall(
				mintTemplate,
				ethereum,
				send,
				partialCall(signNftTemplate, ethereum, config.chainId),
				apis.nftCollection,
				apis.nftLazyMint,
				checkWalletChainId
			),
			transfer: partialCall(
				transferTemplate,
				ethereum,
				send,
				checkAssetType,
				apis.nftItem,
				apis.nftOwnership,
				checkWalletChainId,
			),
			burn: partialCall(burnTemplate, ethereum, send, checkAssetType, apis, checkWalletChainId),
			deploy: {
				erc721: new DeployErc721(ethereum, send, config),
				erc1155: new DeployErc1155(ethereum, send, config),
			},
			cryptoPunks: {
				approveForWrapper: partialCall(
					approveForWrapper,
					ethereum,
					send,
					checkWalletChainId,
					config.cryptoPunks.marketContract,
					config.cryptoPunks.wrapperContract
				),
				wrap: partialCall(
					wrapPunk,
					ethereum,
					send,
					checkWalletChainId,
					config.cryptoPunks.wrapperContract
				),
				unwrap: partialCall(
					unwrapPunk,
					ethereum,
					send,
					checkWalletChainId,
					config.cryptoPunks.wrapperContract
				),
			},
		},
		balances: {
			getBalance: new Balances(apis).getBalance,
			convert: wethConverter.convert,
			getWethContractAddress: wethConverter.getWethContractAddress,
		},
	}
}

type Arr = readonly unknown[]

function partialCall<T extends Arr, U extends Arr, R>(
	f: (...args: [...T, ...U]) => R, ...headArgs: T
): (...tailArgs: U) => R {
	return (...tailArgs: U) => f(...headArgs, ...tailArgs)
}

export {
	isErc1155v2Collection,
	isErc721v2Collection,
	isErc721v3Collection,
	isErc1155v1Collection,
	isErc721v1Collection,
} from "./nft/mint"

export * from "./order/is-nft"
export * from "./common/get-ownership-id"
export * from "./common/parse-item-id"
export * from "./common/parse-ownership-id"
