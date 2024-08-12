import type { ItemId } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import { Action } from "@rarible/action"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { extractBlockchainFromAssetType, validateBlockchain } from "@rarible/sdk-common"
import { extractBlockchain } from "@rarible/sdk-common"
import type { SupportedBlockchain } from "@rarible/sdk-common/build/utils/blockchain"
import type { IBalanceSdk, IEthereumSdk, INftSdk, IOrderInternalSdk, IRaribleInternalSdk } from "../../domain"
import { getCollectionId } from "../../index"
import type { GenerateTokenIdRequest, TokenId } from "../../types/nft/generate-token-id"
import type { BatchFillRequest, PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import type { CanTransferResult, IRestrictionSdk } from "../../types/nft/restriction/domain"
import type { PreprocessMetaRequest, PreprocessMetaResponse } from "../../types/nft/mint/preprocess-meta"
import { Middlewarer } from "../../common/middleware/middleware"
import type {
  ConvertRequest,
  CurrencyOrOrder,
  GetBiddingBalanceRequest,
  IBalanceTransferRequest,
  IDepositBiddingBalance,
  IGetBuyAmmInfo,
  IWithdrawBiddingBalance,
} from "../../types/balances"
import type { RequestCurrency } from "../../common/domain"
import { isAssetType, isRequestCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { ICryptopunkUnwrap, ICryptopunkWrap } from "../../types/ethereum/domain"
import { MethodWithPrepare } from "../../types/common"
import type { ISellUpdate } from "../../types/order/sell"
import type { ISellInternal } from "../../types/order/sell"
import type { IBid, IBidUpdate } from "../../types/order/bid"
import type { IAcceptBid, IBuy, IFill } from "../../types/order/fill"
import type { IBurn } from "../../types/nft/burn"
import type { IMint } from "../../types/nft/mint"
import type { ITransfer } from "../../types/nft/transfer"
import type { CancelOrderRequest } from "../../types/order/cancel/domain"
import type { CreateCollectionRequestSimplified } from "../../types/nft/deploy/simplified"
import type { CreateCollectionResponse } from "../../types/nft/deploy/domain"
import type { IBatchBuy } from "../../types/order/fill"
import type { GetFutureOrderFeeData } from "../../types/nft/restriction/domain"
import type { IFlowSdk } from "../../domain"
import type {
  IFlowSetupAccount,
  IFlowSetupMattelCollections,
  IFlowCheckInitMattelCollections,
} from "../../types/nft/collection"
import type { UnionSupportedBlockchain } from "../../common/utils"
import {
  convertSupportedBlockchainToUnion,
  extractUnionSupportedBlockchain,
  getBidEntity,
  getOrderId,
} from "../../common/utils"
import type { IFlowCheckInitGamisodesCollections } from "../../types/nft/collection"
import type { IGetBuyTxData } from "../../types/ethereum/domain"
import type { MetaUploadRequest, UploadMetaResponse } from "./meta/domain"

export function createUnionSdk(
  evm: IRaribleInternalSdk,
  flow: IRaribleInternalSdk,
  tezos: IRaribleInternalSdk,
  solana: IRaribleInternalSdk,
  eclipse: IRaribleInternalSdk,
  immutablex: IRaribleInternalSdk,
  aptos: IRaribleInternalSdk,
): IRaribleInternalSdk {
  return {
    balances: new UnionBalanceSdk({
      EVM: evm.balances,
      FLOW: flow.balances,
      TEZOS: tezos.balances,
      SOLANA: solana.balances,
      IMMUTABLEX: immutablex.balances,
      ECLIPSE: eclipse.balances,
      APTOS: aptos.balances,
    }),
    nft: new UnionNftSdk({
      EVM: evm.nft,
      FLOW: flow.nft,
      TEZOS: tezos.nft,
      SOLANA: solana.nft,
      IMMUTABLEX: immutablex.nft,
      ECLIPSE: eclipse.nft,
      APTOS: aptos.nft,
    }),
    order: new UnionOrderSdk({
      EVM: evm.order,
      FLOW: flow.order,
      TEZOS: tezos.order,
      SOLANA: solana.order,
      IMMUTABLEX: immutablex.order,
      ECLIPSE: eclipse.order,
      APTOS: aptos.order,
    }),
    restriction: new UnionRestrictionSdk({
      EVM: evm.restriction,
      FLOW: flow.restriction,
      TEZOS: tezos.restriction,
      SOLANA: solana.restriction,
      IMMUTABLEX: immutablex.restriction,
      ECLIPSE: eclipse.restriction,
      APTOS: eclipse.restriction,
    }),
    ethereum: new UnionEthereumSpecificSdk(evm.ethereum!),
    flow: new UnionFlowSpecificSdk(flow.flow!),
  }
}

class UnionOrderSdk implements IOrderInternalSdk {
  bid: IBid
  bidUpdate: IBidUpdate
  /**
   * @deprecated
   * @param request
   */
  fill: IFill
  buy: IBuy
  batchBuy: IBatchBuy
  acceptBid: IAcceptBid
  sell: ISellInternal
  sellUpdate: ISellUpdate

  constructor(private readonly instances: Record<UnionSupportedBlockchain, IOrderInternalSdk>) {
    this.cancel = this.cancel.bind(this)

    this.bid = new MethodWithPrepare(
      request => instances[extractUnionSupportedBlockchain(getBidEntity(request))].bid(request),
      request => instances[extractUnionSupportedBlockchain(getBidEntity(request))].bid.prepare(request),
    )
    this.bidUpdate = new MethodWithPrepare(
      request => instances[extractUnionSupportedBlockchain(request.orderId)].bidUpdate(request),
      request => instances[extractUnionSupportedBlockchain(request.orderId)].bidUpdate.prepare(request),
    )
    this.fill = {
      prepare: (request: PrepareFillRequest): Promise<PrepareFillResponse> => {
        return instances[extractUnionSupportedBlockchain(getOrderId(request))].fill.prepare(request)
      },
    }
    this.buy = new MethodWithPrepare(
      request => instances[extractUnionSupportedBlockchain(getOrderId(request))].buy(request),
      request => instances[extractUnionSupportedBlockchain(getOrderId(request))].buy.prepare(request),
    )

    this.batchBuy = new MethodWithPrepare(
      requests => {
        return instances[getBatchRequestBlockchain(requests)].batchBuy(requests)
      },
      requests => {
        return instances[getBatchRequestBlockchain(requests)].batchBuy.prepare(requests)
      },
    )

    this.acceptBid = new MethodWithPrepare(
      request => instances[extractUnionSupportedBlockchain(getOrderId(request))].acceptBid(request),
      request => instances[extractUnionSupportedBlockchain(getOrderId(request))].acceptBid.prepare(request),
    )
    this.sell = new MethodWithPrepare(
      request => instances[extractUnionSupportedBlockchain(request.itemId)].sell(request),
      request => instances[convertSupportedBlockchainToUnion(request.blockchain)].sell.prepare(request),
    )
    // this.sellUpdate = this.sellUpdate.bind(this)
    this.sellUpdate = new MethodWithPrepare(
      request => instances[extractUnionSupportedBlockchain(request.orderId)].sellUpdate(request),
      request => instances[extractUnionSupportedBlockchain(request.orderId)].sellUpdate.prepare(request),
    )
  }

  cancel(request: CancelOrderRequest): Promise<IBlockchainTransaction> {
    return this.instances[extractUnionSupportedBlockchain(request.orderId)].cancel(request)
  }
}

class UnionNftSdk implements Omit<INftSdk, "mintAndSell"> {
  transfer: ITransfer
  mint: IMint
  burn: IBurn

  constructor(private readonly instances: Record<UnionSupportedBlockchain, Omit<INftSdk, "mintAndSell">>) {
    this.preprocessMeta = Middlewarer.skipMiddleware(this.preprocessMeta.bind(this))
    this.generateTokenId = this.generateTokenId.bind(this)
    this.uploadMeta = this.uploadMeta.bind(this)
    this.createCollection = this.createCollection.bind(this)

    this.transfer = new MethodWithPrepare(
      request => instances[extractUnionSupportedBlockchain(request.itemId)].transfer(request),
      request => instances[extractUnionSupportedBlockchain(request.itemId)].transfer.prepare(request),
    )

    // @ts-ignore
    this.mint = new MethodWithPrepare(
      request =>
        // @ts-ignore
        instances[extractUnionSupportedBlockchain(getCollectionId(request))].mint(request),
      request => instances[extractUnionSupportedBlockchain(getCollectionId(request))].mint.prepare(request),
    )

    this.burn = new MethodWithPrepare(
      request => instances[extractUnionSupportedBlockchain(request.itemId)].burn(request),
      request => instances[extractUnionSupportedBlockchain(request.itemId)].burn.prepare(request),
    )
  }

  createCollection(request: CreateCollectionRequestSimplified): Promise<CreateCollectionResponse> {
    return this.instances[convertSupportedBlockchainToUnion(request.blockchain)].createCollection(request)
  }

  uploadMeta(request: MetaUploadRequest): Promise<UploadMetaResponse> {
    return this.instances[extractUnionSupportedBlockchain(request.accountAddress)].uploadMeta(request)
  }

  generateTokenId(prepare: GenerateTokenIdRequest): Promise<TokenId | undefined> {
    return this.instances[extractUnionSupportedBlockchain(prepare.collection)].generateTokenId(prepare)
  }

  preprocessMeta(request: PreprocessMetaRequest): PreprocessMetaResponse {
    return this.instances[convertSupportedBlockchainToUnion(request.blockchain)].preprocessMeta(request)
  }
}

class UnionBalanceSdk implements IBalanceSdk {
  constructor(private readonly instances: Record<UnionSupportedBlockchain, IBalanceSdk>) {
    this.getBalance = this.getBalance.bind(this)
    this.convert = this.convert.bind(this)
    this.getBiddingBalance = this.getBiddingBalance.bind(this)
    this.transfer = this.transfer.bind(this)
  }

  getBalance(address: UnionAddress, currency: RequestCurrency): Promise<BigNumberValue> {
    const blockchain = getBalanceBlockchain(address, currency)
    return this.instances[convertSupportedBlockchainToUnion(blockchain)].getBalance(address, currency)
  }

  convert(request: ConvertRequest): Promise<IBlockchainTransaction> {
    return this.instances[convertSupportedBlockchainToUnion(validateBlockchain(request.blockchain))].convert(request)
  }

  transfer(request: IBalanceTransferRequest): Promise<IBlockchainTransaction> {
    const blockchain = getBalanceBlockchain(request.recipient, request.currency)
    return this.instances[convertSupportedBlockchainToUnion(blockchain)].transfer(request)
  }

  getBiddingBalance(request: GetBiddingBalanceRequest): Promise<BigNumberValue> {
    const blockchain = getUnionBlockchainFromBidding(request)
    return this.instances[blockchain].getBiddingBalance(request)
  }

  readonly depositBiddingBalance: IDepositBiddingBalance = Action.create({
    id: "send-tx",
    run: request => this.instances[getUnionBlockchainFromBidding(request)].depositBiddingBalance(request),
  })

  readonly withdrawBiddingBalance: IWithdrawBiddingBalance = Action.create({
    id: "send-tx",
    run: request => this.instances[getUnionBlockchainFromBidding(request)].withdrawBiddingBalance(request),
  })
}

class UnionRestrictionSdk implements IRestrictionSdk {
  blockchainFeeData: Map<UnionSupportedBlockchain, GetFutureOrderFeeData> = new Map()

  constructor(private readonly instances: Record<UnionSupportedBlockchain, IRestrictionSdk>) {}

  canTransfer(itemId: ItemId, from: UnionAddress, to: UnionAddress): Promise<CanTransferResult> {
    return this.instances[extractUnionSupportedBlockchain(itemId)].canTransfer(itemId, from, to)
  }

  async getFutureOrderFees(itemId: ItemId): Promise<GetFutureOrderFeeData> {
    const blockchain = extractUnionSupportedBlockchain(itemId)
    if (!this.blockchainFeeData.has(blockchain)) {
      const data = await this.instances[blockchain].getFutureOrderFees(itemId)
      this.blockchainFeeData.set(blockchain, data)
      return data
    }
    return this.blockchainFeeData.get(blockchain)!
  }
}

class UnionEthereumSpecificSdk implements IEthereumSdk {
  constructor(private readonly ethereumSdk: IEthereumSdk) {}

  wrapCryptoPunk: ICryptopunkWrap = this.ethereumSdk.wrapCryptoPunk
  unwrapCryptoPunk: ICryptopunkUnwrap = this.ethereumSdk.unwrapCryptoPunk
  getBatchBuyAmmInfo: IGetBuyAmmInfo = this.ethereumSdk.getBatchBuyAmmInfo
  getBuyTxData: IGetBuyTxData = this.ethereumSdk.getBuyTxData
}

class UnionFlowSpecificSdk implements IFlowSdk {
  constructor(private readonly flowSdk: IFlowSdk) {}

  setupAccount: IFlowSetupAccount = this.flowSdk.setupAccount
  setupMattelCollections: IFlowSetupMattelCollections = this.flowSdk.setupMattelCollections
  setupGamisodesCollections: IFlowSetupMattelCollections = this.flowSdk.setupGamisodesCollections
  checkInitMattelCollections: IFlowCheckInitMattelCollections = this.flowSdk.checkInitMattelCollections
  checkInitGamisodesCollections: IFlowCheckInitGamisodesCollections = this.flowSdk.checkInitGamisodesCollections
}

function getBalanceBlockchain(address: UnionAddress, currency: RequestCurrency): SupportedBlockchain {
  if (isAssetType(currency)) {
    return extractBlockchainFromAssetType(currency) || extractBlockchain(address)
  } else if (isRequestCurrencyAssetType(currency)) {
    const blockchain = extractBlockchain(currency)
    return validateBlockchain(blockchain)
  } else {
    throw new Error(`Unrecognized RequestCurrency ${JSON.stringify(currency)}`)
  }
}

function getBiddingBlockchain(currencyOrOrder: CurrencyOrOrder): SupportedBlockchain {
  if ("currency" in currencyOrOrder) {
    if (isRequestCurrencyAssetType(currencyOrOrder.currency)) {
      return extractBlockchain(currencyOrOrder.currency)
    } else {
      if (isAssetType(currencyOrOrder.currency)) {
        if ("blockchain" in currencyOrOrder.currency && currencyOrOrder.currency.blockchain) {
          return validateBlockchain(currencyOrOrder.currency.blockchain)
        }
        if ("contract" in currencyOrOrder.currency && currencyOrOrder.currency.contract) {
          return extractBlockchain(currencyOrOrder.currency.contract)
        }
        if ("itemId" in currencyOrOrder.currency && currencyOrOrder.currency.itemId) {
          return extractBlockchain(currencyOrOrder.currency.itemId)
        }
        switch (currencyOrOrder.currency["@type"]) {
          case "SOLANA_SOL":
            return Blockchain.SOLANA
          case "ETH":
            return Blockchain.ETHEREUM
          case "XTZ":
            return Blockchain.TEZOS
          default:
        }
      }
    }
    throw new Error(`Unrecognized RequestCurrency ${JSON.stringify(currencyOrOrder.currency)}`)
  } else if ("order" in currencyOrOrder) {
    return extractBlockchain(currencyOrOrder.order.id)
  } else if ("orderId" in currencyOrOrder) {
    return extractBlockchain(currencyOrOrder.orderId)
  } else {
    return currencyOrOrder.blockchain
  }
}

function getUnionBlockchainFromBidding(currencyOrOrder: CurrencyOrOrder): UnionSupportedBlockchain {
  return convertSupportedBlockchainToUnion(getBiddingBlockchain(currencyOrOrder))
}

function getBatchRequestBlockchain(requests: BatchFillRequest | PrepareFillRequest[]): UnionSupportedBlockchain {
  const blockchain = extractBlockchain(getOrderId(requests[0]))
  for (let req of requests) {
    if (extractBlockchain(getOrderId(req)) !== blockchain) {
      throw new Error("All orders should be in same blockchain")
    }
  }
  return convertSupportedBlockchainToUnion(blockchain)
}
