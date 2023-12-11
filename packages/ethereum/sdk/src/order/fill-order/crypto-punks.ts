import type { Ethereum, EthereumFunctionCall, EthereumSendOptions } from "@rarible/ethereum-provider"
import type { Maybe } from "@rarible/types/build/maybe"
import type { OrderData } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/api-client"
import { convertToEVMAddress } from "@rarible/sdk-common"
import { getAssetWithFee } from "../get-asset-with-fee"
import type { EthereumConfig } from "../../config/type"
import { approve } from "../approve"
import type { SendFunction } from "../../common/send-transaction"
import { waitTx } from "../../common/wait-tx"
import type { SimpleCryptoPunkOrder } from "../types"
import { createCryptoPunksMarketContract } from "../../nft/contracts/cryptoPunks"
import type { IRaribleEthereumSdkConfig } from "../../types"
import { invertOrder } from "./invert-order"
import type { CryptoPunksOrderFillRequest, OrderFillSendData, OrderHandler } from "./types"

export class CryptoPunksOrderHandler implements OrderHandler<CryptoPunksOrderFillRequest> {
	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly config: EthereumConfig,
		private readonly getBaseOrderFeeConfig: (type: OrderData["@type"]) => Promise<number>,
		private readonly sdkConfig?: IRaribleEthereumSdkConfig
	) {}

	invert(request: CryptoPunksOrderFillRequest, maker: UnionAddress): SimpleCryptoPunkOrder {
		const inverted = invertOrder(
			request.order,
			request.amount,
			convertToEVMAddress(maker)
		)
		inverted.data = {
			"@type": "ETH_CRYPTO_PUNKS",
		}
		return inverted
	}

	async approve(order: SimpleCryptoPunkOrder, infinite: boolean): Promise<void> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		const withFee = this.getMakeAssetWithFee(order)
		await waitTx(approve(this.ethereum, this.send, this.config.transferProxies, order.maker, withFee, infinite))
	}

	async getTransactionData(
		initial: SimpleCryptoPunkOrder, inverted: SimpleCryptoPunkOrder,
	): Promise<OrderFillSendData> {
		return {
			functionCall: this.getPunkOrderCallMethod(initial),
			options: this.getMatchV2Options(initial, inverted),
		}
	}

	getPunkOrderCallMethod(initial: SimpleCryptoPunkOrder): EthereumFunctionCall {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		if (initial.make.type["@type"] === "CRYPTO_PUNKS") {
			// Call "buyPunk" if makeAsset=cryptoPunk
			const contract = createCryptoPunksMarketContract(this.ethereum, initial.make.type.contract)
			return contract.functionCall("buyPunk", initial.make.type.tokenId)
		} else if (initial.take.type["@type"] === "CRYPTO_PUNKS") {
			// Call "acceptBid" if takeAsset=cryptoPunk
			const contract = createCryptoPunksMarketContract(this.ethereum, initial.take.type.contract)
			return contract.functionCall("acceptBidForPunk", initial.take.type.tokenId, initial.make.value)
		} else {
			throw new Error("Unsupported punk asset type")
		}
	}

	getMatchV2Options(
		left: SimpleCryptoPunkOrder, right: SimpleCryptoPunkOrder,
	): EthereumSendOptions {
		if (right.make.type["@type"] === "ETH") {
			const asset = this.getMakeAssetWithFee(right)
			return { value: asset.value }
		} else {
			return {}
		}
	}

	getMakeAssetWithFee(order: SimpleCryptoPunkOrder) {
		return getAssetWithFee(order.make, this.getOrderFee())
	}

	getOrderFee(): number {
		return 0
	}

	async getBaseOrderFee(): Promise<number> {
		return this.getBaseOrderFeeConfig("ETH_CRYPTO_PUNKS")
	}
}
