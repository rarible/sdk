import type { CollectionId, CurrencyId, ItemId, OrderId, OwnershipId } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { ContractAddress, UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import { Action } from "@rarible/action"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { IBalanceSdk, IEthereumSdk, INftSdk, IOrderInternalSdk, IRaribleInternalSdk } from "../../domain"
import type { PrepareBurnRequest, PrepareBurnResponse } from "../../types/nft/burn/domain"
import type { PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import type { PrepareMintResponse } from "../../types/nft/mint/domain"
import { getCollectionId } from "../../index"
import type { PrepareTransferRequest, PrepareTransferResponse } from "../../types/nft/transfer/domain"
import type { GenerateTokenIdRequest, TokenId } from "../../types/nft/generate-token-id"
import type * as OrderCommon from "../../types/order/common"
import type { PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import type { ICancel } from "../../types/order/cancel/domain"
import type { ICreateCollection } from "../../types/nft/deploy/domain"
import type { CanTransferResult, IRestrictionSdk } from "../../types/nft/restriction/domain"
import type { PreprocessMetaRequest, PreprocessMetaResponse } from "../../types/nft/mint/preprocess-meta"
import type { PrepareBidRequest, PrepareBidResponse, PrepareBidUpdateResponse } from "../../types/order/bid/domain"
import { Middlewarer } from "../../common/middleware/middleware"
import type {
	ConvertRequest,
	CurrencyOrOrder,
	GetBiddingBalanceRequest,
	IDepositBiddingBalance,
	IWithdrawBiddingBalance,
} from "../../types/balances"
import type { RequestCurrency } from "../../common/domain"
import { getDataFromCurrencyId, isAssetType, isRequestCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { PrepareSellInternalRequest, PrepareSellInternalResponse } from "../../types/order/sell/domain"
import type { ICryptopunkUnwrap, ICryptopunkWrap } from "../../types/ethereum/domain"
import type { MetaUploadRequest, UploadMetaResponse } from "./meta/domain"

export function createUnionSdk(
	ethereum: IRaribleInternalSdk,
	flow: IRaribleInternalSdk,
	tezos: IRaribleInternalSdk,
	polygon: IRaribleInternalSdk,
	solana: IRaribleInternalSdk,
	immutablex: IRaribleInternalSdk,
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
	constructor(private readonly instances: Record<Blockchain, IOrderInternalSdk>) {
		this.bid = this.bid.bind(this)
		this.bidUpdate = this.bidUpdate.bind(this)
		this.fill = this.fill.bind(this)
		this.buy = this.buy.bind(this)
		this.acceptBid = this.acceptBid.bind(this)
		this.sell = this.sell.bind(this)
		this.sellUpdate = this.sellUpdate.bind(this)
	}

	bid(request: PrepareBidRequest): Promise<PrepareBidResponse> {
		return this.instances[extractBlockchain(getBidEntity(request))].bid(request)
	}

	bidUpdate(request: OrderCommon.PrepareOrderUpdateRequest): Promise<PrepareBidUpdateResponse> {
		return this.instances[extractBlockchain(request.orderId)].bidUpdate(request)
	}

	/**
	 * @deprecated
	 * @param request
	 */
	fill(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		return this.instances[extractBlockchain(getOrderId(request))].fill(request)
	}

	buy(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		return this.instances[extractBlockchain(getOrderId(request))].buy(request)
	}

	acceptBid(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		return this.instances[extractBlockchain(getOrderId(request))].acceptBid(request)
	}

	sell(request: PrepareSellInternalRequest): Promise<PrepareSellInternalResponse> {
		return this.instances[request.blockchain].sell(request)
	}

	sellUpdate(request: OrderCommon.PrepareOrderUpdateRequest): Promise<OrderCommon.PrepareOrderUpdateResponse> {
		return this.instances[extractBlockchain(request.orderId)].sellUpdate(request)
	}

	cancel: ICancel = Action.create({
		id: "send-tx",
		run: value => this.instances[extractBlockchain(value.orderId)].cancel(value),
	})
}

function getOrderId(req: PrepareFillRequest) {
	if ("orderId" in req) {
		return req.orderId
	} else {
		return req.order.id
	}
}

class UnionNftSdk implements Omit<INftSdk, "mintAndSell"> {
	constructor(private readonly instances: Record<Blockchain, Omit<INftSdk, "mintAndSell">>) {
		this.burn = this.burn.bind(this)
		this.mint = this.mint.bind(this)
		this.transfer = this.transfer.bind(this)
		this.preprocessMeta = Middlewarer.skipMiddleware(this.preprocessMeta.bind(this))
		this.generateTokenId = this.generateTokenId.bind(this)
		this.uploadMeta = this.uploadMeta.bind(this)
	}

	burn(request: PrepareBurnRequest): Promise<PrepareBurnResponse> {
		return this.instances[extractBlockchain(request.itemId)].burn(request)
	}

	uploadMeta(request: MetaUploadRequest): Promise<UploadMetaResponse> {
		return this.instances[extractBlockchain(request.accountAddress)].uploadMeta(request)
	}

	mint(request: PrepareMintRequest): Promise<PrepareMintResponse> {
		const collectionId = getCollectionId(request)
		return this.instances[extractBlockchain(collectionId)].mint(request)
	}

	transfer(request: PrepareTransferRequest): Promise<PrepareTransferResponse> {
		return this.instances[extractBlockchain(request.itemId)].transfer(request)
	}

	generateTokenId(prepare: GenerateTokenIdRequest): Promise<TokenId | undefined> {
		return this.instances[extractBlockchain(prepare.collection)].generateTokenId(prepare)
	}

	preprocessMeta(request: PreprocessMetaRequest): PreprocessMetaResponse {
		return this.instances[request.blockchain].preprocessMeta(request)
	}

	createCollection: ICreateCollection = Action.create({
		id: "send-tx",
		run: request => this.instances[request.blockchain].createCollection(request),
	})

	deploy = this.createCollection
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
}

const blockchains: Blockchain[] = [
	Blockchain.ETHEREUM,
	Blockchain.FLOW,
	Blockchain.TEZOS,
	Blockchain.POLYGON,
	Blockchain.SOLANA,
]

function extractBlockchain(
	value: UnionAddress | ContractAddress | ItemId | OrderId | OwnershipId | CollectionId | CurrencyId,
): Blockchain {
	const idx = value.indexOf(":")
	if (idx === -1) {
		throw new Error(`Unable to extract blockchain from ${value}`)
	}
	const start = value.substring(0, idx)
	for (const blockchain of blockchains) {
		if (blockchain === start) {
			return blockchain
		}
	}
	throw new Error(`Unable to extract blockchain from ${value}`)
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
