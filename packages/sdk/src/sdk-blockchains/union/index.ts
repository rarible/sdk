import type { ItemId } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import { Action } from "@rarible/action"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type {
	IBalanceSdk,
	IEthereumSdk,
	INftSdk,
	IOrderInternalSdk,
	IRaribleInternalSdk,
} from "../../domain"
import { getCollectionId } from "../../index"
import type { GenerateTokenIdRequest, TokenId } from "../../types/nft/generate-token-id"
import type { BatchFillRequest, PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import type { CanTransferResult, IRestrictionSdk } from "../../types/nft/restriction/domain"
import type { PreprocessMetaRequest, PreprocessMetaResponse } from "../../types/nft/mint/preprocess-meta"
import type { PrepareBidRequest } from "../../types/order/bid/domain"
import { Middlewarer } from "../../common/middleware/middleware"
import type {
	ConvertRequest,
	CurrencyOrOrder,
	GetBiddingBalanceRequest,
	IDepositBiddingBalance, IGetBuyAmmInfo,
	IWithdrawBiddingBalance,
} from "../../types/balances"
import type { RequestCurrency } from "../../common/domain"
import { getDataFromCurrencyId, isAssetType, isRequestCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { ICryptopunkUnwrap, ICryptopunkWrap } from "../../types/ethereum/domain"
import {
	MethodWithPrepare,
} from "../../types/common"
import type { ISellUpdate } from "../../types/order/sell"
import type { ISellInternal } from "../../types/order/sell"
import type { IBid, IBidUpdate } from "../../types/order/bid"
import type { IAcceptBid, IBuy, IFill } from "../../types/order/fill"
import type { IBurn } from "../../types/nft/burn"
import type { IMint } from "../../types/nft/mint"
import type { ITransfer } from "../../types/nft/transfer"
import { extractBlockchain } from "../../common/extract-blockchain"
import type { CancelOrderRequest } from "../../types/order/cancel/domain"
import type { CreateCollectionRequestSimplified } from "../../types/nft/deploy/simplified"
import type { CreateCollectionResponse } from "../../types/nft/deploy/domain"
import type { IBatchBuy } from "../../types/order/fill"
import type { MetaUploadRequest, UploadMetaResponse } from "./meta/domain"

export function createUnionSdk(
	ethereum: IRaribleInternalSdk,
	flow: IRaribleInternalSdk,
	tezos: IRaribleInternalSdk,
	polygon: IRaribleInternalSdk,
	solana: IRaribleInternalSdk,
	immutablex: IRaribleInternalSdk,

	// ethereum: () => Promise<IRaribleInternalSdk>,
	// flow: () => Promise<IRaribleInternalSdk>,
	// tezos: () => Promise<IRaribleInternalSdk>,
	// polygon: () => Promise<IRaribleInternalSdk>,
	// solana: () => Promise<IRaribleInternalSdk>,
	// immutablex: () => Promise<IRaribleInternalSdk>,
): IRaribleInternalSdk {
	return {
		balances: new UnionBalanceSdk({
			ETHEREUM: ethereum.balances,
			FLOW: flow.balances,
			TEZOS: tezos.balances,
			POLYGON: polygon.balances,
			SOLANA: solana.balances,
			IMMUTABLEX: immutablex.balances,
		}),
		nft: new UnionNftSdk({
			ETHEREUM: ethereum.nft,
			FLOW: flow.nft,
			TEZOS: tezos.nft,
			POLYGON: polygon.nft,
			SOLANA: solana.nft,
			IMMUTABLEX: immutablex.nft,
		}),
		order: new UnionOrderSdk({
			ETHEREUM: ethereum.order,
			FLOW: flow.order,
			TEZOS: tezos.order,
			POLYGON: polygon.order,
			SOLANA: solana.order,
			IMMUTABLEX: immutablex.order,
		}),
		restriction: new UnionRestrictionSdk({
			ETHEREUM: ethereum.restriction,
			FLOW: flow.restriction,
			TEZOS: tezos.restriction,
			POLYGON: polygon.restriction,
			SOLANA: solana.restriction,
			IMMUTABLEX: immutablex.restriction,
		}),
		ethereum: new UnionEthereumSpecificSdk(ethereum.ethereum!),
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

  constructor(private readonly instances: Record<Blockchain, IOrderInternalSdk>) {
  	this.cancel = this.cancel.bind(this)

  	this.bid = new MethodWithPrepare(
  		(request) =>
  			instances[extractBlockchain(getBidEntity(request))].bid(request),
  		(request) =>
  			instances[extractBlockchain(getBidEntity(request))].bid.prepare(request),
  	)
  	this.bidUpdate = new MethodWithPrepare(
  		(request) =>
  			instances[extractBlockchain(request.orderId)].bidUpdate(request),
  		(request) =>
  			instances[extractBlockchain(request.orderId)].bidUpdate.prepare(request),
  	)
  	this.fill = {
  		prepare: (request: PrepareFillRequest): Promise<PrepareFillResponse> => {
  			return instances[extractBlockchain(getOrderId(request))].fill.prepare(request)
  		},
  	}
  	this.buy = new MethodWithPrepare(
  		(request) =>
  			instances[extractBlockchain(getOrderId(request))].buy(request),
  		(request) =>
  			instances[extractBlockchain(getOrderId(request))].buy.prepare(request),
  	)

  	this.batchBuy = new MethodWithPrepare(
  		(requests) => {
  			return instances[getBatchRequestBlockchain(requests)].batchBuy(requests)
  		},
  		(requests) => {
  			return instances[getBatchRequestBlockchain(requests)].batchBuy.prepare(requests)
  		}
  	)

  	this.acceptBid = new MethodWithPrepare(
  		(request) =>
  			instances[extractBlockchain(getOrderId(request))].acceptBid(request),
  		(request) =>
  			instances[extractBlockchain(getOrderId(request))].acceptBid.prepare(request),
  	)
  	this.sell = new MethodWithPrepare(
  		(request) =>
  			instances[extractBlockchain(request.itemId)].sell(request),
  		(request) =>
  			instances[request.blockchain].sell.prepare(request),
  	)
  	// this.sellUpdate = this.sellUpdate.bind(this)
  	this.sellUpdate = new MethodWithPrepare(
  		(request) =>
  			instances[extractBlockchain(request.orderId)].sellUpdate(request),
  		(request) =>
  			instances[extractBlockchain(request.orderId)].sellUpdate.prepare(request),
  	)

  }

  cancel(request: CancelOrderRequest): Promise<IBlockchainTransaction> {
  	return this.instances[extractBlockchain(request.orderId)].cancel(request)
  }
}

function getOrderId(req: PrepareFillRequest) {
	if ("orderId" in req) {
		return req.orderId
	} else {
		return req.order.id
	}
}

class UnionNftSdk implements Omit<INftSdk, "mintAndSell"> {
  transfer: ITransfer
  mint: IMint
  burn: IBurn

  constructor(private readonly instances: Record<Blockchain, Omit<INftSdk, "mintAndSell">>) {
  	this.preprocessMeta = Middlewarer.skipMiddleware(this.preprocessMeta.bind(this))
  	this.generateTokenId = this.generateTokenId.bind(this)
  	this.uploadMeta = this.uploadMeta.bind(this)
  	this.createCollection = this.createCollection.bind(this)

  	this.transfer = new MethodWithPrepare(
  		(request) =>
  			instances[extractBlockchain(request.itemId)].transfer(request),
  		(request) =>
  			instances[extractBlockchain(request.itemId)].transfer.prepare(request),
  	)

  	// @ts-ignore
  	this.mint = new MethodWithPrepare(
  		(request) =>
  	// @ts-ignore
  			instances[extractBlockchain(getCollectionId(request))].mint(request),
  		(request) =>
  			instances[extractBlockchain(getCollectionId(request))].mint.prepare(request),
  	)

  	this.burn =  new MethodWithPrepare(
  		(request) =>
  			instances[extractBlockchain(request.itemId)].burn(request),
  		(request) =>
  			instances[extractBlockchain(request.itemId)].burn.prepare(request),
  	)
  }

  createCollection(request: CreateCollectionRequestSimplified): Promise<CreateCollectionResponse> {
  	return this.instances[request.blockchain].createCollection(request)
  }

  uploadMeta(request: MetaUploadRequest): Promise<UploadMetaResponse> {
  	return this.instances[extractBlockchain(request.accountAddress)].uploadMeta(request)
  }

  generateTokenId(prepare: GenerateTokenIdRequest): Promise<TokenId | undefined> {
  	return this.instances[extractBlockchain(prepare.collection)].generateTokenId(prepare)
  }

  preprocessMeta(request: PreprocessMetaRequest): Promise<PreprocessMetaResponse> {
  	return this.instances[request.blockchain].preprocessMeta(request)
  }
}

class UnionBalanceSdk implements IBalanceSdk {
	constructor(private readonly instances: Record<Blockchain, IBalanceSdk>) {
		this.getBalance = this.getBalance.bind(this)
		this.convert = this.convert.bind(this)
		this.getBiddingBalance = this.getBiddingBalance.bind(this)
	}

	getBalance(address: UnionAddress, currency: RequestCurrency): Promise<BigNumberValue> {
		return this.instances[getBalanceBlockchain(address, currency)].getBalance(address, currency)
	}

	convert(request: ConvertRequest): Promise<IBlockchainTransaction> {
		return this.instances[request.blockchain].convert(request)
	}

	getBiddingBalance(request: GetBiddingBalanceRequest): Promise<BigNumberValue> {
		return this.instances[getBiddingBlockchain(request)].getBiddingBalance(request)
	}

	depositBiddingBalance: IDepositBiddingBalance = Action.create({
		id: "send-tx",
		run: request => this.instances[getBiddingBlockchain(request)].depositBiddingBalance(request),
	})

	withdrawBiddingBalance: IWithdrawBiddingBalance = Action.create({
		id: "send-tx",
		run: request => this.instances[getBiddingBlockchain(request)].withdrawBiddingBalance(request),
	})
}

class UnionRestrictionSdk implements IRestrictionSdk {
	constructor(private readonly instances: Record<Blockchain, IRestrictionSdk>) {
	}

	canTransfer(
		itemId: ItemId, from: UnionAddress, to: UnionAddress,
	): Promise<CanTransferResult> {
		return this.instances[extractBlockchain(itemId)].canTransfer(itemId, from, to)
	}
}

class UnionEthereumSpecificSdk implements IEthereumSdk {
	constructor(private readonly ethereumSdk: IEthereumSdk) {
	}

	wrapCryptoPunk: ICryptopunkWrap = this.ethereumSdk.wrapCryptoPunk
	unwrapCryptoPunk: ICryptopunkUnwrap = this.ethereumSdk.unwrapCryptoPunk
  getBatchBuyAmmInfo: IGetBuyAmmInfo = this.ethereumSdk.getBatchBuyAmmInfo
}


function getBidEntity(request: PrepareBidRequest) {
	if ("itemId" in request) {
		return request.itemId
	} else if ("collectionId" in request) {
		return request.collectionId
	} else {
		throw new Error("Bit request should contains itemId or collectionId")
	}
}

function getBalanceBlockchain(address: UnionAddress, currency: RequestCurrency): Blockchain {
	if (isAssetType(currency)) {
		if ("blockchain" in currency && currency.blockchain) {
			return currency.blockchain
		}
		if ("contract" in currency && currency.contract) {
			return extractBlockchain(currency.contract)
		}
		return extractBlockchain(address)
	} else if (isRequestCurrencyAssetType(currency)) {
		const { blockchain } = getDataFromCurrencyId(currency)
		return blockchain
	} else {
		throw new Error(`Unrecognized RequestCurrency ${JSON.stringify(currency)}`)
	}
}


function getBiddingBlockchain(currencyOrOrder: CurrencyOrOrder): Blockchain {
	if ("currency" in currencyOrOrder) {
		if (isRequestCurrencyAssetType(currencyOrOrder.currency)) {
			return extractBlockchain(currencyOrOrder.currency)
		} else {
			if (isAssetType(currencyOrOrder.currency)) {
				if ("blockchain" in currencyOrOrder.currency && currencyOrOrder.currency.blockchain) {
					return currencyOrOrder.currency.blockchain
				}
				if ("contract" in currencyOrOrder.currency && currencyOrOrder.currency.contract) {
					return extractBlockchain(currencyOrOrder.currency.contract)
				}
				if ("itemId" in currencyOrOrder.currency && currencyOrOrder.currency.itemId) {
					return extractBlockchain(currencyOrOrder.currency.itemId)
				}
				switch (currencyOrOrder.currency["@type"]) {
					case "SOLANA_SOL": return Blockchain.SOLANA
					case "ETH": return Blockchain.ETHEREUM
					case "XTZ": return Blockchain.TEZOS
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

function getBatchRequestBlockchain(requests: BatchFillRequest | PrepareFillRequest[]): Blockchain {
	const blockchain = extractBlockchain(getOrderId(requests[0]))
	for (let req of requests) {
		if (extractBlockchain(getOrderId(req)) !== blockchain) {
			throw new Error("All orders should be in same blockchain")
		}
	}
	return blockchain
}
