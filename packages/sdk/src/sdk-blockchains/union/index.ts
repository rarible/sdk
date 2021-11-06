import type { AssetType, Blockchain, ItemId, OrderId, OwnershipId } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import { Action } from "@rarible/action"
import type { IBalanceSdk, INftSdk, IOrderInternalSdk, IRaribleInternalSdk } from "../../domain"
import type { PrepareBurnRequest, PrepareBurnResponse } from "../../types/nft/burn/domain"
import type { PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import type { PrepareMintResponse } from "../../types/nft/mint/domain"
import { getCollectionId } from "../../index"
import type { PrepareTransferRequest, PrepareTransferResponse } from "../../types/nft/transfer/domain"
import type {
	PrepareOrderInternalRequest,
	PrepareOrderInternalResponse, PrepareOrderRequest, PrepareOrderResponse,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../../types/order/common"
import type { PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import type { ICancel } from "../../types/order/cancel/domain"

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
			POLYGON: null as any, //todo add when POLYGON is implemented
		}),
		nft: new UnionNftSdk({
			ETHEREUM: ethereum.nft,
			FLOW: flow.nft,
			TEZOS: tezos.nft,
			POLYGON: null as any, //todo add when POLYGON is implemented
		}),
		order: new UnionOrderSdk({
			ETHEREUM: ethereum.order,
			FLOW: flow.order,
			TEZOS: tezos.order,
			POLYGON: null as any,
		}),
	}
}

class UnionOrderSdk implements IOrderInternalSdk {
	constructor(
		private readonly instances: Record<Blockchain, IOrderInternalSdk>,
	) {
		this.bid = this.bid.bind(this)
		this.bidUpdate = this.bidUpdate.bind(this)
		this.fill = this.fill.bind(this)
		this.sell = this.sell.bind(this)
		this.sellUpdate = this.sellUpdate.bind(this)
	}

	bid(request: PrepareOrderRequest): Promise<PrepareOrderResponse> {
		return this.instances[extractBlockchain(request.itemId)].bid(request)
	}

	bidUpdate(request: PrepareOrderUpdateRequest): Promise<PrepareOrderUpdateResponse> {
		return this.instances[extractBlockchain(request.orderId)].bidUpdate(request)
	}

	fill(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		return this.instances[extractBlockchain(getOrderId(request))].fill(request)
	}

	sell(request: PrepareOrderInternalRequest): Promise<PrepareOrderInternalResponse> {
		return this.instances[extractBlockchain(request.collectionId)].sell(request)
	}

	sellUpdate(request: PrepareOrderUpdateRequest): Promise<PrepareOrderUpdateResponse> {
		return this.instances[extractBlockchain(request.orderId)].sellUpdate(request)
	}

	cancel: ICancel = Action.create({
		id: "send-tx",
		run: value => {
			return this.instances[extractBlockchain(value.orderId)].cancel(value)
		},
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
	constructor(
		private readonly instances: Record<Blockchain, Omit<INftSdk, "mintAndSell">>,
	) {
		this.burn = this.burn.bind(this)
		this.mint = this.mint.bind(this)
		this.transfer = this.transfer.bind(this)
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
}

class UnionBalanceSdk implements IBalanceSdk {
	constructor(
		private readonly instances: Record<Blockchain, IBalanceSdk>,
	) {
		this.getBalance = this.getBalance.bind(this)
	}

	getBalance(address: UnionAddress, assetType: AssetType): Promise<BigNumberValue> {
		return this.instances[extractBlockchain(address)].getBalance(address, assetType)
	}
}

const blockchains = [
	"ETHEREUM",
	"FLOW",
	"TEZOS",
]

function extractBlockchain(value: UnionAddress | ItemId | OrderId | OwnershipId): Blockchain {
	const idx = value.indexOf(":")
	if (idx === -1) {
		throw new Error(`Unable to extract blockchain from ${value}`)
	}
	const start = value.substring(0, idx)
	for (const blockchain of blockchains) {
		if (blockchain === start) {
			return blockchain as Blockchain
		}
	}
	throw new Error(`Unable to extract blockchain from ${value}`)
}
