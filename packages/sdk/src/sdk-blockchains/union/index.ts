import type { ItemId } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import { Action } from "@rarible/action"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { AmmTradeInfo } from "@rarible/ethereum-api-client"
import type { IBalanceSdk, IEthereumSdk, INftSdk, IOrderInternalSdk, IRaribleInternalSdk } from "../../domain"
import { getCollectionId } from "../../index"
import type { GenerateTokenIdRequest, TokenId } from "../../types/nft/generate-token-id"
import type { BatchFillRequest, PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import type { CanTransferResult, IRestrictionSdk } from "../../types/nft/restriction/domain"
import type { PreprocessMetaRequest, PreprocessMetaResponse } from "../../types/nft/mint/preprocess-meta"
import type { PrepareBidRequest } from "../../types/order/bid/domain"
import { Middlewarer } from "../../common/middleware/middleware"
import type {
	BuyAmmInfoRequest,
	ConvertRequest,
	CurrencyOrOrder,
	GetBiddingBalanceRequest,
	IDepositBiddingBalance,
	IWithdrawBiddingBalance,
} from "../../types/balances"
import type { RequestCurrency } from "../../common/domain"
import { getDataFromCurrencyId, isAssetType, isRequestCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { CryptopunkUnwrapRequest, CryptopunkWrapRequest } from "../../types/ethereum/domain"
import { MethodWithPrepare } from "../../types/common"
import type { ISellInternal, ISellUpdate } from "../../types/order/sell"
import type { IBid, IBidUpdate } from "../../types/order/bid"
import type { IAcceptBid, IBatchBuy, IBuy, IFill } from "../../types/order/fill"
import type { IBurn } from "../../types/nft/burn"
import type { IMint } from "../../types/nft/mint"
import type { ITransfer } from "../../types/nft/transfer"
import { extractBlockchain } from "../../common/extract-blockchain"
import type { CancelOrderRequest } from "../../types/order/cancel/domain"
import type { CreateCollectionRequestSimplified } from "../../types/nft/deploy/simplified"
import type { CreateCollectionResponse } from "../../types/nft/deploy/domain"
import type { MetaUploadRequest, UploadMetaResponse } from "./meta/domain"

export function createUnionSdk(
	ethereum: () => Promise<IRaribleInternalSdk>,
	flow: () => Promise<IRaribleInternalSdk>,
	tezos: () => Promise<IRaribleInternalSdk>,
	polygon: () => Promise<IRaribleInternalSdk>,
	solana: () => Promise<IRaribleInternalSdk>,
	immutablex: () => Promise<IRaribleInternalSdk>,
): IRaribleInternalSdk {

	const blockchainModuleGetter = async (blockchain: Blockchain) => {
		switch (blockchain) {
			case Blockchain.ETHEREUM: return await ethereum()
			case Blockchain.FLOW: return await flow()
			case Blockchain.TEZOS: return await tezos()
			case Blockchain.POLYGON: return await polygon()
			case Blockchain.SOLANA: return await solana()
			case Blockchain.IMMUTABLEX: return await immutablex()
			default:
				throw new Error("Unsupported blockchain " + blockchain)
		}
	}
	return {
		balances: new UnionBalanceSdk(blockchainModuleGetter),
		nft: new UnionNftSdk(blockchainModuleGetter),
		order: new UnionOrderSdk(blockchainModuleGetter),
		restriction: new UnionRestrictionSdk(blockchainModuleGetter),
		ethereum: new UnionEthereumSpecificSdk(ethereum),
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

  constructor(private readonly instances: (blockchain: Blockchain) => Promise<IRaribleInternalSdk>) {
  	this.cancel = this.cancel.bind(this)

  	this.bid = new MethodWithPrepare(
  		async (request) =>
			  (await instances(extractBlockchain(getBidEntity(request)))).order.bid(request),
		  async (request) =>
			  (await instances(extractBlockchain(getBidEntity(request)))).order.bid.prepare(request),
  	)
  	this.bidUpdate = new MethodWithPrepare(
		  async (request) =>
			  (await instances(extractBlockchain(request.orderId))).order.bidUpdate(request),
		  async (request) =>
			  (await instances(extractBlockchain(request.orderId))).order.bidUpdate.prepare(request),
  	)
  	this.fill = {
  		prepare: async (request: PrepareFillRequest): Promise<PrepareFillResponse> => {
  			return (await instances(extractBlockchain(getOrderId(request)))).order.fill.prepare(request)
  		},
  	}
  	this.buy = new MethodWithPrepare(
		  async (request) =>
			  (await instances(extractBlockchain(getOrderId(request)))).order.buy(request),
		  async (request) =>
			  (await instances(extractBlockchain(getOrderId(request)))).order.buy.prepare(request),
  	)

  	this.batchBuy = new MethodWithPrepare(
		  async (requests) => {
  			return (await instances(getBatchRequestBlockchain(requests))).order.batchBuy(requests)
  		},
		  async (requests) => {
  			return (await instances(getBatchRequestBlockchain(requests))).order.batchBuy.prepare(requests)
  		}
  	)

  	this.acceptBid = new MethodWithPrepare(
		  async (request) =>
			  (await instances(extractBlockchain(getOrderId(request)))).order.acceptBid(request),
		  async (request) =>
			  (await instances(extractBlockchain(getOrderId(request)))).order.acceptBid.prepare(request),
  	)
  	this.sell = new MethodWithPrepare(
		  async (request) =>
			  (await instances(extractBlockchain(request.itemId))).order.sell(request),
		  async (request) =>
			  (await instances(request.blockchain)).order.sell.prepare(request),
  	)
  	// this.sellUpdate = this.sellUpdate.bind(this)
  	this.sellUpdate = new MethodWithPrepare(
		  async (request) =>
			  (await instances(extractBlockchain(request.orderId))).order.sellUpdate(request),
		  async (request) =>
			  (await instances(extractBlockchain(request.orderId))).order.sellUpdate.prepare(request),
  	)
  }

  async cancel(request: CancelOrderRequest): Promise<IBlockchainTransaction> {
  	return (await this.instances(extractBlockchain(request.orderId))).order.cancel(request)
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

  constructor(private readonly instances: (blockchain: Blockchain) => Promise<IRaribleInternalSdk>) {
  	this.preprocessMeta = Middlewarer.skipMiddleware(this.preprocessMeta.bind(this))
  	this.generateTokenId = this.generateTokenId.bind(this)
  	this.uploadMeta = this.uploadMeta.bind(this)
  	this.createCollection = this.createCollection.bind(this)

  	this.transfer = new MethodWithPrepare(
  		async (request) =>
  			(await instances(extractBlockchain(request.itemId))).nft.transfer(request),
		  async (request) =>
			  (await instances(extractBlockchain(request.itemId))).nft.transfer.prepare(request),
  	)

  	this.mint = new MethodWithPrepare(
  		async (request) =>
			  //@ts-ignore
			  (await instances(extractBlockchain(getCollectionId(request)))).nft.mint(request),
  		async (request) =>
			  (await instances(extractBlockchain(getCollectionId(request)))).nft.mint.prepare(request),
  	)

  	this.burn =  new MethodWithPrepare(
		  async (request) =>
			  (await instances(extractBlockchain(request.itemId))).nft.burn(request),
		  async (request) =>
			  (await instances(extractBlockchain(request.itemId))).nft.burn.prepare(request),
  	)
  }

  async createCollection(request: CreateCollectionRequestSimplified): Promise<CreateCollectionResponse> {
  	return (await this.instances(request.blockchain)).nft.createCollection(request)
  }

  async uploadMeta(request: MetaUploadRequest): Promise<UploadMetaResponse> {
  	return (await this.instances(extractBlockchain(request.accountAddress))).nft.uploadMeta(request)
  }

  async generateTokenId(prepare: GenerateTokenIdRequest): Promise<TokenId | undefined> {
  	return (await this.instances(extractBlockchain(prepare.collection))).nft.generateTokenId(prepare)
  }

  async preprocessMeta(request: PreprocessMetaRequest): Promise<PreprocessMetaResponse> {
  	return (await this.instances(request.blockchain)).nft.preprocessMeta(request)
  }
}

class UnionBalanceSdk implements IBalanceSdk {
	constructor(private readonly instances: (blockchain: Blockchain) => Promise<IRaribleInternalSdk>) {
		this.getBalance = this.getBalance.bind(this)
		this.convert = this.convert.bind(this)
		this.getBiddingBalance = this.getBiddingBalance.bind(this)
	}

	async getBalance(address: UnionAddress, currency: RequestCurrency): Promise<BigNumberValue> {
		return (await this.instances(getBalanceBlockchain(address, currency))).balances.getBalance(address, currency)
	}

	async convert(request: ConvertRequest): Promise<IBlockchainTransaction> {
		return (await this.instances(request.blockchain)).balances.convert(request)
	}

	async getBiddingBalance(request: GetBiddingBalanceRequest): Promise<BigNumberValue> {
		return (await this.instances(getBiddingBlockchain(request))).balances.getBiddingBalance(request)
	}

	depositBiddingBalance: IDepositBiddingBalance = Action.create({
		id: "send-tx",
		run: async request => (await this.instances(getBiddingBlockchain(request)))
			.balances.depositBiddingBalance(request),
	})

	withdrawBiddingBalance: IWithdrawBiddingBalance = Action.create({
		id: "send-tx",
		run: async request => (await this.instances(getBiddingBlockchain(request)))
			.balances.withdrawBiddingBalance(request),
	})
}

class UnionRestrictionSdk implements IRestrictionSdk {
	constructor(private readonly instances: (blockchain: Blockchain) => Promise<IRaribleInternalSdk>) {
	}

	async canTransfer(
		itemId: ItemId, from: UnionAddress, to: UnionAddress,
	): Promise<CanTransferResult> {
		return (await this.instances(extractBlockchain(itemId))).restriction.canTransfer(itemId, from, to)
	}
}

class UnionEthereumSpecificSdk implements IEthereumSdk {
	constructor(private readonly ethereumGetter: () => Promise<IRaribleInternalSdk>) {
		this.wrapCryptoPunk = this.wrapCryptoPunk.bind(this)
		this.unwrapCryptoPunk = this.unwrapCryptoPunk.bind(this)
		this.getBatchBuyAmmInfo = this.getBatchBuyAmmInfo.bind(this)
	}

	async wrapCryptoPunk(request: CryptopunkWrapRequest): Promise<IBlockchainTransaction> {
		return (await this.ethereumGetter()).ethereum!.wrapCryptoPunk(request)
	}

	async unwrapCryptoPunk(request: CryptopunkUnwrapRequest): Promise<IBlockchainTransaction> {
		return (await this.ethereumGetter()).ethereum!.unwrapCryptoPunk(request)
	}

	async getBatchBuyAmmInfo(request: BuyAmmInfoRequest): Promise<AmmTradeInfo> {
		return (await this.ethereumGetter()).ethereum!.getBatchBuyAmmInfo(request)
	}
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
