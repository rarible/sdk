import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { ContractAddress } from "@rarible/types"
import { toAddress, toBinary, toContractAddress, toUnionAddress, toWord } from "@rarible/types"
import { toBigNumber } from "@rarible/types/build/big-number"
import type * as ApiClient from "@rarible/api-client"
import type { AssetType, OrderId } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { AssetType as EthereumAssetType } from "@rarible/ethereum-api-client/build/models/AssetType"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { AssetTypeRequest } from "@rarible/protocol-ethereum-sdk/build/order/check-asset-type"
import { Action } from "@rarible/action"
import { addFee } from "@rarible/protocol-ethereum-sdk/build/order/add-fee"
import { getDecimals } from "@rarible/protocol-ethereum-sdk/build/common/get-decimals"
import { getPrice } from "@rarible/protocol-ethereum-sdk/build/common/get-price"
import { compareCaseInsensitive } from "@rarible/protocol-ethereum-sdk/build/common/compare-case-insensitive"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import { Warning } from "@rarible/logger/build"
import type { Item } from "@rarible/api-client/build/models"
import type * as OrderCommon from "../../types/order/common"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type {
	GetConvertableValueRequest,
	GetConvertableValueResult,
	PrepareBidRequest,
	PrepareBidResponse,
	PrepareBidUpdateResponse,
} from "../../types/order/bid/domain"
import { getCommonConvertableValue } from "../../common/get-convertable-value"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { RequestCurrencyAssetType } from "../../common/domain"
import type { BidSimplifiedRequest, BidUpdateSimplifiedRequest } from "../../types/order/bid/simplified"
import { convertDateToTimestamp, getDefaultExpirationDateTimestamp } from "../../common/get-expiration-date"
import type { IApisSdk } from "../../domain"
import { checkRoyalties } from "../../common/check-royalties"
import { getCollectionFromItemId } from "../../common/utils"
import type { EVMBlockchain } from "./common"
import * as common from "./common"
import {
	checkWalletBlockchain,
	convertEthereumContractAddress,
	convertEthereumToUnionAddress,
	convertOrderType,
	convertToEthereumAddress,
	convertToEthereumAssetType,
	extractEVMBlockchain,
	getEthereumItemId,
	getOrderAmount,
	getOrderFeesSum,
	getOriginFeeSupport,
	getPayoutsSupport,
	isEVMBlockchain,
	isRaribleOrderData,
	isWETH,
} from "./common"
import type { EthereumBalance } from "./balance"
import type { IEthereumSdkConfig } from "./domain"

export class EthereumBid {

	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private apis: IApisSdk,
		private balanceService: EthereumBalance,
		private config?: IEthereumSdkConfig
	) {
		this.bid = this.bid.bind(this)
		this.update = this.update.bind(this)
		this.getConvertableValue = this.getConvertableValue.bind(this)
		this.convertCurrency = this.convertCurrency.bind(this)
		this.bidBasic = this.bidBasic.bind(this)
		this.bidUpdateBasic = this.bidUpdateBasic.bind(this)
	}

	convertAssetType(assetType: EthereumAssetType, blockchain: EVMBlockchain): ApiClient.AssetType {
		switch (assetType.assetClass) {
			case "ETH": {
				return {
					"@type": "ETH",
				}
			}
			case "ERC20": {
				return {
					"@type": "ERC20",
					contract: convertEthereumContractAddress(assetType.contract, blockchain),
				}
			}
			case "ERC721": {
				return {
					"@type": "ERC721",
					contract: convertEthereumContractAddress(assetType.contract, blockchain),
					tokenId: assetType.tokenId,
				}
			}
			case "ERC721_LAZY": {
				return {
					"@type": "ERC721_Lazy",
					contract: convertEthereumContractAddress(assetType.contract, blockchain),
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
					contract: convertEthereumContractAddress(assetType.contract, blockchain),
					tokenId: assetType.tokenId,
				}
			}
			case "ERC1155_LAZY": {
				return {
					"@type": "ERC1155_Lazy",
					contract: convertEthereumContractAddress(assetType.contract, blockchain),
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
					contract: convertEthereumContractAddress(assetType.contract, blockchain),
				}
			}
			default: {
				throw new Error(`Unsupported asset type ${assetType.assetClass}`)
			}
		}
	}

	async bidBasic(request: BidSimplifiedRequest): Promise<OrderId> {
		const prepare = await this.bid(request)
		return prepare.submit(request)
	}

	async bidUpdateBasic(request: BidUpdateSimplifiedRequest): Promise<OrderId> {
		const updateResponse = await this.update(request)
		return updateResponse.submit(request)
	}

	async bid(prepare: PrepareBidRequest): Promise<PrepareBidResponse> {
		if ("itemId" in prepare) {
			const collectionId = getCollectionFromItemId(prepare.itemId)
			const collection = await this.apis.collection.getCollectionById({ collection: collectionId })

			if (collection.self) {
				await checkRoyalties(prepare.itemId, this.apis)
			}
		}

		return this.bidDataV2(prepare)
	}

	async bidDataV2(prepare: PrepareBidRequest): Promise<PrepareBidResponse> {
		const {
			ethAssetType,
			item,
			contract,
			blockchain,
		} = await getTakeAssetType(this.apis, prepare)

		const collection = await this.apis.collection.getCollectionById({
			collection: contract,
		})

		const bidAction = this.sdk.order.bid
			.before(async (request: OrderCommon.OrderRequest) => {
				await checkWalletBlockchain(this.wallet, blockchain)
				const expirationDate = request.expirationDate
					? convertDateToTimestamp(request.expirationDate)
					: getDefaultExpirationDateTimestamp()
				const currencyAssetType = getCurrencyAssetType(request.currency)
				return {
					type: "DATA_V2",
					makeAssetType: common.getEthTakeAssetType(currencyAssetType),
					takeAssetType: ethAssetType,
					amount: getOrderAmount(request.amount, collection),
					priceDecimal: request.price,
					payouts: common.toEthereumParts(request.payouts),
					originFees: common.toEthereumParts(request.originFees),
					end: expirationDate,
				}
			})
			.after(async (res) => {
				await res.approveTx?.wait()
				return common.convertEthereumOrderHash(res.order.hash, blockchain)
			})

		const submit = Action.create({
			id: "convert" as const,
			run: async (request: OrderCommon.OrderRequest) => {
				await checkWalletBlockchain(this.wallet, blockchain)
				const currency = getCurrencyAssetType(request.currency)
				if (currency["@type"] === "ERC20") {
					const wrappedContract = await this.sdk.balances.getWethContractAddress()
					if (![Blockchain.MANTLE, Blockchain.CELO].includes(blockchain)
            && compareCaseInsensitive(convertToEthereumAddress(currency.contract), wrappedContract)) {
						const feeBp = request.originFees?.reduce((prev, curr) => prev + curr.value, 0) || 0
						const quantity = getOrderAmount(request.amount, collection)
						const value = await this.getConvertableValueCommon(
							currency,
							request.price,
							quantity,
							feeBp,
							blockchain
						)
						await this.convertCurrency(value)
					}
				}
				return request
			},
		}).thenAction(bidAction)

		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportedCurrencies: common.getSupportedCurrencies(Blockchain.ETHEREUM, true),
			multiple: collection.type === "ERC1155",
			maxAmount: item ? item.supply : null,
			baseFee: await this.sdk.order.getBaseOrderFee(),
			getConvertableValue: this.getConvertableValue.bind(this, blockchain),
			supportsExpirationDate: true,
			shouldTransferFunds: false,
			submit,
		}
	}

	private async getConvertableValue(
		blockchain: EVMBlockchain,
		request: GetConvertableValueRequest,
	): Promise<GetConvertableValueResult> {
		const assetType = this.getAssetTypeForConvert(request)
		if (assetType["@type"] === "ERC20") {
			const wrappedCurrency = await this.sdk.balances.getWethContractAddress()
			if (![Blockchain.MANTLE, Blockchain.CELO].includes(blockchain)
        && compareCaseInsensitive(convertToEthereumAddress(assetType.contract), wrappedCurrency)) {
				const feeBp = request.originFees.reduce((prev, curr) => prev + curr.value, 0)
				return this.getConvertableValueCommon(assetType, request.price, request.amount, feeBp, blockchain)
			}
		}

		return undefined
	}

	private getAssetTypeForConvert(request: GetConvertableValueRequest): AssetType {
		if (request.assetType) return request.assetType
		if (request.currencyId) return getCurrencyAssetType(request.currencyId)
		throw new Error("assetType or currencyId should be specified")
	}

	async getConvertableValueCommon(
		assetType: RequestCurrencyAssetType,
		price: BigNumberValue,
		quantity: BigNumberValue,
		originFeeBp: number,
		blockchain: EVMBlockchain
	) {
		const wallet = common.assertWallet(this.wallet)
		const convertedAssetType = convertToEthereumAssetType(assetType)
		const valueRaw = toBn(price).multipliedBy(quantity)
		const [convertedPrice, baseFeeBp] = await Promise.all([
			getPrice(wallet.ethereum, convertedAssetType, valueRaw),
			this.sdk.order.getBaseOrderFee(),
		])

		const valueWithFee = addFee(
			{
				assetType: convertedAssetType,
				value: toBigNumber(convertedPrice.toString()),
			},
			originFeeBp + baseFeeBp
		)
		const [assetDecimals, from] = await Promise.all([
			getDecimals(wallet.ethereum, convertedAssetType),
			wallet.ethereum.getFrom(),
		])

		const fromUnion = convertEthereumToUnionAddress(from, Blockchain.ETHEREUM)
		const asset: AssetType = { "@type": "ETH", blockchain }
		const value = toBn(valueWithFee.value).integerValue().div(toBn(10).pow(assetDecimals))

		return getCommonConvertableValue(this.balanceService.getBalance, fromUnion, value, asset, assetType)
	}

	async convertCurrency(convertable: GetConvertableValueResult): Promise<void> {
		if (convertable?.type === "insufficient") throw new InsufficientFundsError()
		if (convertable?.type === "convertable") {
			const tx = await this.sdk.balances.deposit(convertable.value)
			await tx.wait()
		}
		return
	}

	async update(prepareRequest: OrderCommon.PrepareOrderUpdateRequest): Promise<PrepareBidUpdateResponse> {
		if (!prepareRequest.orderId) {
			throw new Error("OrderId has not been specified")
		}

		const [blockchain, hash] = prepareRequest.orderId.split(":")
		if (!isEVMBlockchain(blockchain)) {
			throw new Error("Not an ethereum order")
		}

		const order = await this.apis.order.getValidatedOrderById({
			id: prepareRequest.orderId,
		})
		if (!isRaribleOrderData(order.data)) {
			throw new UpdateBidNotSupportedForThidKindOfOrderError(order.data["@type"])
		}

		const bidUpdateAction = this.sdk.order.bidUpdate
			.before(async (request: OrderCommon.OrderUpdateRequest) => {
				await checkWalletBlockchain(this.wallet, blockchain)
				return {
					orderHash: toWord(hash),
					priceDecimal: request.price,
				}
			})
			.after(async (res) => {
				await res.approveTx?.wait()
				return common.convertEthereumOrderHash(res.order.hash, blockchain)
			})

		const actionWithConvert = Action
			.create({
				id: "convert" as const,
				run: async (request: OrderCommon.OrderUpdateRequest) => {
					await checkWalletBlockchain(this.wallet, blockchain)
					if ([Blockchain.MANTLE, Blockchain.CELO].includes(blockchain)) {
						return request
					}
					if (isWETH(order.make.type, await this.sdk.balances.getWethContractAddress())) {
						const feesBp = getOrderFeesSum(order)
						const value = await this.getConvertableValueCommon(
							order.make.type as ApiClient.EthErc20AssetType | ApiClient.EthEthereumAssetType,
							request.price,
							order.take.value,
							feesBp,
							blockchain,
						)
						await this.convertCurrency(value)
					}

					return request
				},
			})
			.thenAction(bidUpdateAction)

		return {
			originFeeSupport: getOriginFeeSupport(order.data),
			payoutsSupport: getPayoutsSupport(order.data),
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportedCurrencies: common.getSupportedCurrencies(Blockchain.ETHEREUM, true),
			baseFee: await this.sdk.order.getBaseOrderFee(convertOrderType(order.data)),
			getConvertableValue: this.getConvertableValue.bind(this, blockchain),
			submit: actionWithConvert,
			orderData: {
				nftCollection: "contract" in order.take.type
					? order.take.type.contract
					: undefined,
			},
		}
	}
}

export class InsufficientFundsError extends Error {
	constructor() {
		super("Insufficient funds for convertation")
		this.name = "InsufficientFundsError"
	}
}

export class UpdateBidNotSupportedForThidKindOfOrderError extends Error {
	constructor(type: string) {
		super(`Update bid is not supported for ${type} kind of order`)
		this.name = "UpdateBidNotSupportedForThidKindOfOrderError"
	}
}


async function getTakeAssetType(
	apis: IApisSdk,
	prepare: PrepareBidRequest
): Promise<{ethAssetType: AssetTypeRequest, item?: Item, contract: ContractAddress, blockchain: EVMBlockchain}> {
	if ("itemId" in prepare) {
		const item = await apis.item.getItemById({ itemId: prepare.itemId })
		const { tokenId, contract, domain } = getEthereumItemId(item.id)

		return {
			ethAssetType: {
				tokenId: tokenId,
				contract: toAddress(contract),
			},
			item,
			contract: toContractAddress(item.contract),
			blockchain: domain,
		}
	} else if ("collectionId" in prepare) {
		return {
			ethAssetType: {
				assetClass: "COLLECTION",
				contract: convertToEthereumAddress(prepare.collectionId),
			},
			contract: toContractAddress(prepare.collectionId),
			blockchain: extractEVMBlockchain(prepare.collectionId),
		}
	} else {
		throw new Warning("ItemId or CollectionId must be assigned")
	}
}
