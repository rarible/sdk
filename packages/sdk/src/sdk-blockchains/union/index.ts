import type { AssetType, ItemId, OrderId, OwnershipId } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { ContractAddress, UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import { Action } from "@rarible/action"
import type { IBalanceSdk, INftSdk, IOrderInternalSdk, IRaribleInternalSdk } from "../../domain"
import type { PrepareBurnRequest, PrepareBurnResponse } from "../../types/nft/burn/domain"
import type { PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import type { PrepareMintResponse } from "../../types/nft/mint/domain"
import { getCollectionId } from "../../index"
import type { PrepareTransferRequest, PrepareTransferResponse } from "../../types/nft/transfer/domain"
import type { GenerateTokenIdRequest, TokenId } from "../../types/nft/generate-token-id"
import type * as OrderCommon from "../../types/order/common"
import type { PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import type { ICancel } from "../../types/order/cancel/domain"
import type { IDeploy } from "../../types/nft/deploy/domain"
import type { CanTransferResult, IRestrictionSdk } from "../../types/nft/restriction/domain"
import type { PreprocessMetaRequest, PreprocessMetaResponse } from "../../types/nft/mint/preprocess-meta"
import type { PrepareBidResponse } from "../../types/order/bid/domain"

export function createUnionSdk(
	ethereum: IRaribleInternalSdk,
	flow: IRaribleInternalSdk,
	tezos: IRaribleInternalSdk,
): IRaribleInternalSdk {
	return {
		balances: new UnionBalanceSdk({
			ETHEREUM: ethereum.balances,
			FLOW: flow.balances,
			TEZOS: tezos.balances,
			POLYGON: {} as any, // @todo add when POLYGON is implemented
		}),
		nft: new UnionNftSdk({
			ETHEREUM: ethereum.nft,
			FLOW: flow.nft,
			TEZOS: tezos.nft,
			POLYGON: {} as any, // @todo add when POLYGON is implemented
		}),
		order: new UnionOrderSdk({
			ETHEREUM: ethereum.order,
			FLOW: flow.order,
			TEZOS: tezos.order,
			POLYGON: {} as any,
		}),
		restriction: new UnionRestrictionSdk({
			ETHEREUM: ethereum.restriction,
			FLOW: flow.restriction,
			TEZOS: tezos.restriction,
			POLYGON: {} as any,
		})	}
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

	bid(request: OrderCommon.PrepareOrderRequest): Promise<PrepareBidResponse> {
		return this.instances[extractBlockchain(request.itemId)].bid(request)
	}

	bidUpdate(request: OrderCommon.PrepareOrderUpdateRequest): Promise<OrderCommon.PrepareOrderUpdateResponse> {
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

	sell(request: OrderCommon.PrepareOrderInternalRequest): Promise<OrderCommon.PrepareOrderInternalResponse> {
		return this.instances[extractBlockchain(request.collectionId)].sell(request)
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
		this.preprocessMeta = this.preprocessMeta.bind(this)
		this.generateTokenId = this.generateTokenId.bind(this)
	}

	burn(request: PrepareBurnRequest): Promise<PrepareBurnResponse> {
		return this.instances[extractBlockchain(request.itemId)].burn(request)
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

	deploy: IDeploy = Action.create({
		id: "send-tx",
		run: request => this.instances[request.blockchain].deploy(request),
	})
}

class UnionBalanceSdk implements IBalanceSdk {
	constructor(private readonly instances: Record<Blockchain, IBalanceSdk>) {
		this.getBalance = this.getBalance.bind(this)
	}

	getBalance(address: UnionAddress, assetType: AssetType): Promise<BigNumberValue> {
		return this.instances[extractBlockchain(address)].getBalance(address, assetType)
	}
}

class UnionRestrictionSdk implements IRestrictionSdk {
	constructor(private readonly instances: Record<Blockchain, IRestrictionSdk>) {
	}

	canTransfer(
		itemId: ItemId, from: UnionAddress, to: UnionAddress
	): Promise<CanTransferResult> {
		return this.instances[extractBlockchain(itemId)].canTransfer(itemId, from, to)
	}
}

const blockchains: Blockchain[] = [
	Blockchain.ETHEREUM,
	Blockchain.FLOW,
	Blockchain.TEZOS,
]

function extractBlockchain(value: UnionAddress | ContractAddress | ItemId | OrderId | OwnershipId): Blockchain {
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
