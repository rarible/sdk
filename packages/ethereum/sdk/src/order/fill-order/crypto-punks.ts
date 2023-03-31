import type { Address } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumFunctionCall, EthereumSendOptions, EthereumTransaction } from "@rarible/ethereum-provider"
import type { Maybe } from "@rarible/types/build/maybe"
import { getAssetWithFee } from "../get-asset-with-fee"
import type { EthereumConfig } from "../../config/type"
import { approve } from "../approve"
import type { SendFunction } from "../../common/send-transaction"
import { waitTx } from "../../common/wait-tx"
import type { SimpleCryptoPunkOrder } from "../types"
import { createCryptoPunksMarketContract } from "../../nft/contracts/cryptoPunks"
import type { SimpleOrder } from "../types"
import type { IRaribleEthereumSdkConfig } from "../../types"
import { invertOrder } from "./invert-order"
import type { CryptoPunksOrderFillRequest, OrderFillSendData, OrderHandler } from "./types"

export class CryptoPunksOrderHandler implements OrderHandler<CryptoPunksOrderFillRequest> {
	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly config: EthereumConfig,
		private readonly getBaseOrderFeeConfig: (type: SimpleOrder["type"]) => Promise<number>,
		private readonly sdkConfig?: IRaribleEthereumSdkConfig
	) {}

	invert(request: CryptoPunksOrderFillRequest, maker: Address): SimpleCryptoPunkOrder {
		const inverted = invertOrder(request.order, request.amount, maker)
		inverted.data = {
			dataType: "CRYPTO_PUNKS_DATA",
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

	async sendTransaction(
		initial: SimpleCryptoPunkOrder, inverted: SimpleCryptoPunkOrder,
	): Promise<EthereumTransaction> {
		const { functionCall, options } = await this.getTransactionData(initial, inverted)
		return this.send(functionCall, options)
	}

	getPunkOrderCallMethod(initial: SimpleCryptoPunkOrder): EthereumFunctionCall {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		if (initial.make.assetType.assetClass === "CRYPTO_PUNKS") {
			// Call "buyPunk" if makeAsset=cryptoPunk
			const contract = createCryptoPunksMarketContract(this.ethereum, initial.make.assetType.contract)
			return contract.functionCall("buyPunk", initial.make.assetType.tokenId)
		} else if (initial.take.assetType.assetClass === "CRYPTO_PUNKS") {
			// Call "acceptBid" if takeAsset=cryptoPunk
			const contract = createCryptoPunksMarketContract(this.ethereum, initial.take.assetType.contract)
			return contract.functionCall("acceptBidForPunk", initial.take.assetType.tokenId, initial.make.value)
		} else {
			throw new Error("Unsupported punk asset type")
		}
	}

	getMatchV2Options(
		left: SimpleCryptoPunkOrder, right: SimpleCryptoPunkOrder,
	): EthereumSendOptions {
		if (right.make.assetType.assetClass === "ETH") {
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
		return this.getBaseOrderFeeConfig("CRYPTO_PUNK")
	}
}
