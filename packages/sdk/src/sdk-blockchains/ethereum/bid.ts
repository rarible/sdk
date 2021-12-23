import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { UnionAddress } from "@rarible/types"
import { toBinary, toUnionAddress, toWord } from "@rarible/types"
import { toBigNumber } from "@rarible/types/build/big-number"
import type * as EthereumApiClient from "@rarible/ethereum-api-client"
import type * as ApiClient from "@rarible/api-client"
import type { AssetType as EthereumAssetType } from "@rarible/ethereum-api-client/build/models/AssetType"
import type { AssetType } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import BigNumber from "bignumber.js"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { Blockchain } from "@rarible/api-client"
import type * as OrderCommon from "../../types/order/common"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { PrepareBidResponse } from "../../types/order/bid/domain"
import type { GetConvertableValueResult } from "../../types/order/bid/domain"
import * as common from "./common"
import {
	convertToEthereumAssetType,
	convertEthereumContractAddress, convertEthereumUnionAddress,
} from "./common"
import type { EthereumBalance } from "./balance"

export class EthereumBid {
	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private balanceService: EthereumBalance,
		private network: EthereumNetwork,
	) {
		this.bid = this.bid.bind(this)
		this.update = this.update.bind(this)
		this.getConvertableValue = this.getConvertableValue.bind(this)
		this.convertCurrency = this.convertCurrency.bind(this)
	}

	convertAssetType(assetType: EthereumAssetType): ApiClient.AssetType {
		switch (assetType.assetClass) {
			case "ETH": {
				return {
					"@type": "ETH",
				}
			}
			case "ERC20": {
				return {
					"@type": "ERC20",
					contract: convertEthereumContractAddress(assetType.contract),
				}
			}
			case "ERC721": {
				return {
					"@type": "ERC721",
					contract: convertEthereumContractAddress(assetType.contract),
					tokenId: assetType.tokenId,
				}
			}
			case "ERC721_LAZY": {
				return {
					"@type": "ERC721_Lazy",
					contract: convertEthereumContractAddress(assetType.contract),
					tokenId: assetType.tokenId,
					uri: assetType.uri,
					creators: assetType.creators.map((c) => ({
						account: toUnionAddress(c.account),
						value: c.value,
					})),
					royalties: assetType.royalties.map((r) => ({
						account: toUnionAddress(r.account),
						value: r.value,
					})),
					signatures: assetType.signatures.map((str) => toBinary(str)),
				}
			}
			case "ERC1155": {
				return {
					"@type": "ERC1155",
					contract: convertEthereumContractAddress(assetType.contract),
					tokenId: assetType.tokenId,
				}
			}
			case "ERC1155_LAZY": {
				return {
					"@type": "ERC1155_Lazy",
					contract: convertEthereumContractAddress(assetType.contract),
					tokenId: assetType.tokenId,
					uri: assetType.uri,
					supply: assetType.supply !== undefined
						? toBigNumber(assetType.supply)
						: toBigNumber("1"),
					creators: assetType.creators.map((c) => ({
						account: toUnionAddress(c.account),
						value: c.value,
					})),
					royalties: assetType.royalties.map((r) => ({
						account: toUnionAddress(r.account),
						value: r.value,
					})),
					signatures: assetType.signatures.map(toBinary),
				}
			}
			case "GEN_ART": {
				return {
					"@type": "GEN_ART",
					contract: convertEthereumContractAddress(assetType.contract),
				}
			}
			default: {
				throw new Error(`Unsupported asset type ${assetType.assetClass}`)
			}
		}
	}

	getAsset(asset: EthereumApiClient.Asset): ApiClient.Asset {
		return {
			type: this.convertAssetType(asset.assetType),
			value: asset.value,
		}
	}

	async bid(prepare: OrderCommon.PrepareOrderRequest): Promise<PrepareBidResponse> {
		if (!prepare.itemId) {
			throw new Error("ItemId has not been specified")
		}

		const [domain, contract, tokenId] = prepare.itemId.split(":")
		if (domain !== "ETHEREUM") {
			throw new Error(`Not an ethereum item: ${prepare.itemId}`)
		}

		const item = await this.sdk.apis.nftItem.getNftItemById({
			itemId: `${contract}:${tokenId}`,
		})
		const collection = await this.sdk.apis.nftCollection.getNftCollectionById({
			collection: item.contract,
		})

		const submit = this.sdk.order.bid
			.before(async (request: OrderCommon.OrderRequest) => {
				return {
					makeAssetType: common.getEthTakeAssetType(request.currency),
					takeAssetType: {
						tokenId: item.tokenId,
						contract: item.contract,
					},
					amount: request.amount,
					priceDecimal: request.price,
					payouts: common.toEthereumParts(request.payouts),
					originFees: common.toEthereumParts(request.originFees),
				}
			})
			.after((order) => common.convertEthereumOrderHash(order.hash))

		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportedCurrencies: common.getSupportedCurrencies(),
			multiple: collection.type === "ERC1155",
			maxAmount: item.supply,
			baseFee: await this.sdk.order.getBaseOrderFee(),
			getConvertableValue: this.getConvertableValue,
			convert: this.convertCurrency,
			submit,
		}
	}

	getConvertMap() {
		return {
			[convertEthereumUnionAddress(this.sdk.balances.getWethContractAddress())]: "ETH",
		}
	}

	private async getConvertableValue(
		assetType: AssetType, value: BigNumberValue, walletAddress: UnionAddress
	): Promise<GetConvertableValueResult> {
		const convertMap = this.getConvertMap()

		if (assetType["@type"] === "ERC20" && assetType["contract"] in convertMap) {
			const wrappedTokenBalance = await this.balanceService.getBalance(walletAddress, assetType)

			if (new BigNumber(wrappedTokenBalance).gte(value)) {
				return undefined
			}

			const ethBalance = await this.balanceService.getBalance(walletAddress, { "@type": "ETH" })

			if (new BigNumber(ethBalance).plus(wrappedTokenBalance).gte(value)) {
				return {
					type: "convertable",
					currency: { "@type": "ETH" },
					value: new BigNumber(value).minus(wrappedTokenBalance),
				}
			}

			return {
				type: "insufficient",
				currency: { "@type": "ETH" },
				value: new BigNumber(value).minus(ethBalance),
			}
		} else {
			return undefined
		}
	}

	private async convertCurrency(
		from: AssetType, to: AssetType, value: BigNumberValue
	): Promise<IBlockchainTransaction> {
		const tx = await this.sdk.balances.convert(
			convertToEthereumAssetType(from),
			convertToEthereumAssetType(to),
			value
		)

		return new BlockchainEthereumTransaction(tx, this.network)
	}

	async update(
		prepareRequest: OrderCommon.PrepareOrderUpdateRequest,
	): Promise<OrderCommon.PrepareOrderUpdateResponse> {
		if (!prepareRequest.orderId) {
			throw new Error("OrderId has not been specified")
		}
		const [blockchain, hash] = prepareRequest.orderId.split(":")
		if (blockchain !== Blockchain.ETHEREUM) {
			throw new Error("Not an ethereum order")
		}

		const order = await this.sdk.apis.order.getOrderByHash({ hash })
		if (order.type !== "RARIBLE_V2" && order.type !== "RARIBLE_V1") {
			throw new Error(`Unable to update bid ${JSON.stringify(order)}`)
		}

		const sellUpdateAction = this.sdk.order.bidUpdate
			.before((request: OrderCommon.OrderUpdateRequest) => ({
				orderHash: toWord(hash),
				priceDecimal: request.price,
			}))
			.after((order) => common.convertEthereumOrderHash(order.hash))

		return {
			originFeeSupport:
				order.type === "RARIBLE_V2"
					? OriginFeeSupport.FULL
					: OriginFeeSupport.AMOUNT_ONLY,
			payoutsSupport:
				order.type === "RARIBLE_V2"
					? PayoutsSupport.MULTIPLE
					: PayoutsSupport.SINGLE,
			supportedCurrencies: common.getSupportedCurrencies(),
			baseFee: await this.sdk.order.getBaseOrderFee(order.type),
			submit: sellUpdateAction,
		}
	}
}
