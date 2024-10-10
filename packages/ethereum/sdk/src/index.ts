import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { EVMAddress, AssetType, OrderForm } from "@rarible/ethereum-api-client"
import type { BigNumber } from "@rarible/utils"
import type { Address, Maybe } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import type { AmmTradeInfo } from "@rarible/ethereum-api-client/build/models"
import type { GetAmmBuyInfoRequest } from "@rarible/ethereum-api-client/build/apis/OrderControllerApi"
import { deprecatedMethod, deprecatedMethodAction } from "@rarible/sdk-common"
import { getNetworkConfigByChainId } from "./config"
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
import { createEthereumApis, getApis as getApisTemplate } from "./common/apis"
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
import type { BalanceRequestAssetType, TransferBalanceAsset } from "./common/balances"
import { Balances } from "./common/balances"
import type { EthereumNetwork, IRaribleEthereumSdkConfig } from "./types"
import { LogsLevel } from "./types"
import { ConvertWeth } from "./order/convert-weth"
import { createRemoteLogger, getEnvironment } from "./common/logger/logger"
import type { CryptoPunksWrapper } from "./common/crypto-punks"
import { approveForWrapper, unwrapPunk, wrapPunk } from "./nft/cryptopunk-wrapper"
import { BatchOrderFiller } from "./order/fill-order/batch-purchase/batch-purchase"
import { getRequiredWallet } from "./common/get-required-wallet"
import { CURRENT_ORDER_TYPE_VERSION } from "./common/order"
import type { AuctionStartAction, PutAuctionBidAction, BuyoutAuctionAction } from "./auction/types"

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
   * @param request order and parameters (amount to fill, fees etc.)
   */
  fill: FillOrderAction

  /**
   * Buy order
   *
   * @param request order and parameters (amount to fill, fees etc.)
   */
  buy: FillOrderAction

  /**
   * Accept bid order
   *
   * @param request order and parameters (amount to fill, fees etc.)
   */
  acceptBid: FillOrderAction

  /**
   * Purchase batch
   *
   * @param request array of order and parameters (amount to fill, fees etc.)
   */
  buyBatch: FillBatchOrderAction

  /**
   * Get fill transaction data (for external sending)
   *
   * @param request order and parameters (amount to fill, fees etc.)
   */
  getFillTxData: GetOrderFillTxData

  /**
   * Get buy transaction data (for external sending)
   *
   * @param request order and parameters (amount to fill, fees etc.)
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
  transfer(asset: TransferAsset, to: EVMAddress, amount?: BigNumberValue): Promise<EthereumTransaction>

  /**
   * @param request burn request
   */
  burn(request: BurnRequest): Promise<EthereumTransaction | void>

  deploy: DeployNft

  cryptoPunks: CryptoPunksWrapper
}

export interface RaribleBalancesSdk {
  /**
   * Returns balance of user, it can return balances for ERC20 and native ETH
   *
   * @param address balance owner
   * @param assetType type of asset. Supports ERC20 and ETH
   * @returns balance of user
   */
  getBalance(address: EVMAddress | EVMAddress, assetType: BalanceRequestAssetType): Promise<BigNumber>

  /**
   * Transfer native token or ERC-20 to recipient
   * @param address Recipient of tokens
   * @param asset Object includes currency type and transfer value
   */
  transfer(address: EVMAddress | EVMAddress, asset: TransferBalanceAsset): Promise<EthereumTransaction>
  /**
   * Convert ETH balance from/to the Wrapped Ether (ERC-20) token
   * @depreacted please use `deposit` or `withdraw`
   *
   * @param from ETH or ERC20 Wrapped Ether asset type
   * @param to ERC20 Wrapped Ether or ETH asset type
   * @param value Value to convert
   * @returns `EthereumTransaction`
   */
  convert(from: AssetType, to: AssetType, value: BigNumberValue): Promise<EthereumTransaction>

  /**
   * Adds balance to wrapped currency
   * Works for Polygon (Wrapped Matic) and Ethereum (Wrapped Eth)
   *
   * @param value - amount of tokens
   * @returns `EthereumTransaction`
   */
  deposit(value: BigNumberValue): Promise<EthereumTransaction>

  /**
   * Adds balance to wrapped currency
   * Works for Polygon (Wrapped Matic) and Ethereum (Wrapped Eth)
   *
   * @param valueInWei - amount of tokens in wei
   * @returns `EthereumTransaction`
   */
  depositWei(valueInWei: BigNumberValue): Promise<EthereumTransaction>

  /**
   * Withdraw wrapped balance to native currency
   * Works for Polygon (Wrapped matic) and Ethereum (Wrapped Eth)
   *
   * @param value - amount of tokens
   * @returns `EthereumTransaction`
   */
  withdraw(value: BigNumberValue): Promise<EthereumTransaction>

  /**
   * Withdraw wrapped balance to native currency
   * Works for Polygon (Wrapped matic) and Ethereum (Wrapped Eth)
   *
   * @param valueInWei - amount of tokens in wei
   * @returns `EthereumTransaction`
   */
  withdrawWei(valueInWei: BigNumberValue): Promise<EthereumTransaction>

  /**
   * @returns address of Wrapped currency (ERC-20)
   * Works for polygon (wrapped Matic) and ethereum (wrapped Eth)
   */
  getWethContractAddress(): Promise<Address>
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
  getHash: (auctionId: string) => Promise<string>
}

export interface RaribleSdk {
  order: RaribleOrderSdk
  nft: RaribleNftSdk
  auction: RaribleAuctionSdk
  apis: RaribleEthereumApis
  balances: RaribleBalancesSdk
}

export function createRaribleSdk(
  ethereum: Maybe<Ethereum>,
  env: EthereumNetwork,
  sdkConfig?: IRaribleEthereumSdkConfig,
): RaribleSdk {
  const getConfig = async () => {
    const chainId = await getRequiredWallet(ethereum).getChainId()
    return getNetworkConfigByChainId(chainId)
  }

  const apis = createEthereumApis(env, {
    ...(sdkConfig?.apiClientParams || {}),
    apiKey: sdkConfig?.apiKey,
  })
  const getApis = getApisTemplate.bind(null, ethereum, env, sdkConfig)

  const send = partialCall(
    getSendWithInjects({
      logger: {
        instance: createRemoteLogger({
          ethereum,
          env: getEnvironment(env),
          sessionId: sdkConfig?.logs?.session,
          apiKey: sdkConfig?.apiKey,
        }),
        level: sdkConfig?.logs?.level ?? LogsLevel.DISABLED,
      },
    }),
  )
  const checkLazyAssetType = partialCall(order.checkLazyAssetType, getApis)
  const checkLazyAsset = partialCall(order.checkLazyAsset, checkLazyAssetType)
  const checkLazyOrder = order.checkLazyOrder.bind(null, checkLazyAsset)
  const checkAssetType = partialCall(checkAssetTypeTemplate, getApis)
  const balanceService = new Balances(ethereum, send, getApis)

  const getBaseOrderFeeOld = getBaseFee.bind(null, env, getApis)
  const getBaseOrderFee = (type?: OrderForm["type"]) => {
    return getBaseFee(env, getApis, type || CURRENT_ORDER_TYPE_VERSION)
  }
  const filler = new OrderFiller(ethereum, send, getConfig, getApis, getBaseOrderFeeOld, env, sdkConfig)
  const buyBatchService = new BatchOrderFiller(ethereum, send, getConfig, getApis, getBaseOrderFeeOld, env, sdkConfig)

  const approveFn = partialCall(approveTemplate, ethereum, send, getConfig)

  const upsertService = new UpsertOrder(
    filler,
    send,
    getConfig,
    checkLazyOrder,
    approveFn,
    partialCall(signOrderTemplate, ethereum, getConfig),
    getApis,
    ethereum,
  )

  const sellService = new OrderSell(upsertService, checkAssetType)
  const bidService = new OrderBid(upsertService, checkAssetType)
  const wethConverter = new ConvertWeth(ethereum, send, getConfig)

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
      cancel: partialCall(cancelTemplate, checkLazyOrder, ethereum, send, getConfig, getApis),
      getBaseOrderFee: getBaseOrderFee,
      getBaseOrderFillFee: filler.getBaseOrderFillFee,
      getBuyAmmInfo: filler.getBuyAmmInfo,
    },
    auction: {
      start: deprecatedMethodAction,
      cancel: deprecatedMethod,
      finish: deprecatedMethod,
      putBid: deprecatedMethodAction,
      buyOut: deprecatedMethodAction,
      getHash: deprecatedMethod,
    },
    nft: {
      mint: partialCall(mintTemplate, ethereum, send, partialCall(signNftTemplate, ethereum, getConfig), getApis),
      transfer: partialCall(transferTemplate, ethereum, send, checkAssetType, getApis),
      burn: partialCall(burnTemplate, ethereum, send, checkAssetType, getApis),
      deploy: {
        erc721: new DeployErc721(ethereum, send, getConfig),
        erc1155: new DeployErc1155(ethereum, send, getConfig),
      },
      cryptoPunks: {
        approveForWrapper: partialCall(approveForWrapper, ethereum, send, getConfig),
        wrap: partialCall(wrapPunk, ethereum, send, getConfig),
        unwrap: partialCall(unwrapPunk, ethereum, send, getConfig),
      },
    },
    balances: {
      getBalance: balanceService.getBalance,
      transfer: balanceService.transfer,
      convert: wethConverter.convert,
      deposit: wethConverter.deposit,
      depositWei: wethConverter.depositWei,
      withdraw: wethConverter.withdraw,
      withdrawWei: wethConverter.withdrawWei,
      getWethContractAddress: wethConverter.getWethContractAddress,
    },
  }
}

type Arr = readonly unknown[]

function partialCall<T extends Arr, U extends Arr, R>(
  f: (...args: [...T, ...U]) => R,
  ...headArgs: T
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
