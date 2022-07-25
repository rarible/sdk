import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { Address, ContractAddress } from "@rarible/types"
import { toBinary, toContractAddress, toUnionAddress, toWord } from "@rarible/types"
import { toBigNumber } from "@rarible/types/build/big-number"
import type * as ApiClient from "@rarible/api-client"
import type { AssetType } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { AssetType as EthereumAssetType } from "@rarible/ethereum-api-client/build/models/AssetType"
import BigNumber from "bignumber.js"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { NftItem } from "@rarible/ethereum-api-client/build/models"
import type { AssetTypeRequest } from "@rarible/protocol-ethereum-sdk/build/order/check-asset-type"
import { Action } from "@rarible/action"
import { addFee } from "@rarible/protocol-ethereum-sdk/build/order/add-fee"
import { getDecimals } from "@rarible/protocol-ethereum-sdk/build/common/get-decimals"
import { getPrice } from "@rarible/protocol-ethereum-sdk/build/common/get-price"
import type { BigNumberValue } from "@rarible/utils"
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
import type { EVMBlockchain } from "./common"
import * as common from "./common"
import {
	convertEthereumContractAddress,
	convertEthereumToUnionAddress,
	convertToEthereumAddress,
	convertToEthereumAssetType,
	getEthereumItemId,
	getEVMBlockchain,
	getOrderFeesSum,
	getOriginFeeSupport,
	getPayoutsSupport,
	isEVMBlockchain,
	validateOrderDataV3Request,
} from "./common"
import type { EthereumBalance } from "./balance"
import type { IEthereumSdkConfig } from "./domain"

export class EthereumBid {
	private readonly blockchain: EVMBlockchain

	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private balanceService: EthereumBalance,
		private network: EthereumNetwork,
		private config?: IEthereumSdkConfig
	) {
		this.blockchain = getEVMBlockchain(network)
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
					contract: convertEthereumContractAddress(assetType.contract, this.blockchain),
				}
			}
			case "ERC721": {
				return {
					"@type": "ERC721",
					contract: convertEthereumContractAddress(assetType.contract, this.blockchain),
					tokenId: assetType.tokenId,
				}
			}
			case "ERC721_LAZY": {
				return {
					"@type": "ERC721_Lazy",
					contract: convertEthereumContractAddress(assetType.contract, this.blockchain),
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
					contract: convertEthereumContractAddress(assetType.contract, this.blockchain),
					tokenId: assetType.tokenId,
				}
			}
			case "ERC1155_LAZY": {
				return {
					"@type": "ERC1155_Lazy",
					contract: convertEthereumContractAddress(assetType.contract, this.blockchain),
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
					contract: convertEthereumContractAddress(assetType.contract, this.blockchain),
				}
			}
			default: {
				throw new Error(`Unsupported asset type ${assetType.assetClass}`)
			}
		}
	}

	getWethContractAddress(): ContractAddress {
		const convertMap = this.getConvertMap()
		const wethAddressEntry = Object.entries(convertMap)
			.find(([contractAddr, currency]) => contractAddr && currency === "ETH")

		if (!wethAddressEntry) {
			throw new Error("Weth contract address has not been found")
		}
		const [wethUnionContract] = wethAddressEntry
		return toContractAddress(wethUnionContract)
	}

	async bid(prepare: PrepareBidRequest): Promise<PrepareBidResponse> {
		if (this.config?.useDataV3) {
			return this.bidDataV3(prepare)
		} else {
			return this.bidDataV2(prepare)
		}
	}

	async bidDataV2(prepare: PrepareBidRequest): Promise<PrepareBidResponse> {
		let contractAddress: Address | undefined
		let item: NftItem | undefined
		let takeAssetType: AssetTypeRequest

		if ("itemId" in prepare) {
			const { itemId } = getEthereumItemId(prepare.itemId)
			item = await this.sdk.apis.nftItem.getNftItemById({ itemId })
			contractAddress = item.contract

			takeAssetType = {
				tokenId: item.tokenId,
				contract: item.contract,
			}
		} else if ("collectionId" in prepare) {
			contractAddress = convertToEthereumAddress(prepare.collectionId)
			takeAssetType = {
				assetClass: "COLLECTION",
				contract: contractAddress,
			}
		} else {
			throw new Error("ItemId or CollectionId must be assigned")
		}

		const collection = await this.sdk.apis.nftCollection.getNftCollectionById({
			collection: contractAddress,
		})

		const bidAction = this.sdk.order.bid
			.before(async (request: OrderCommon.OrderRequest) => {
				const expirationDate = request.expirationDate instanceof Date
					? Math.floor(request.expirationDate.getTime() / 1000)
					: undefined
				const currencyAssetType = getCurrencyAssetType(request.currency)
				return {
					type: "DATA_V2",
					makeAssetType: common.getEthTakeAssetType(currencyAssetType),
					takeAssetType: takeAssetType,
					amount: request.amount,
					priceDecimal: request.price,
					payouts: common.toEthereumParts(request.payouts),
					originFees: common.toEthereumParts(request.originFees),
					end: expirationDate,
				}
			})
			.after((order) => common.convertEthereumOrderHash(order.hash, this.blockchain))

		const submit = Action.create({
			id: "convert" as const,
			run: async (request: OrderCommon.OrderRequest) => {
				const wethContractAddress = this.getWethContractAddress()
				const currency = getCurrencyAssetType(request.currency)
				if (currency["@type"] === "ERC20" && currency.contract.toLowerCase() === wethContractAddress.toLowerCase()) {
					const originFeesSum = request.originFees?.reduce((acc, fee) => fee.value, 0) || 0
					const value = await this.getConvertableValueCommon(
						currency,
						request.price,
						request.amount,
						originFeesSum
					)
					await this.convertCurrency(value)
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
			getConvertableValue: this.getConvertableValue,
			supportsExpirationDate: true,
			submit,
		}
	}

	async bidDataV3(prepare: PrepareBidRequest): Promise<PrepareBidResponse> {
		let contractAddress: Address | undefined
		let item: NftItem | undefined
		let takeAssetType: AssetTypeRequest

		if ("itemId" in prepare) {
			const { itemId } = getEthereumItemId(prepare.itemId)
			item = await this.sdk.apis.nftItem.getNftItemById({ itemId })
			contractAddress = item.contract

			takeAssetType = {
				tokenId: item.tokenId,
				contract: item.contract,
			}
		} else if ("collectionId" in prepare) {
			contractAddress = convertToEthereumAddress(prepare.collectionId)
			takeAssetType = {
				assetClass: "COLLECTION",
				contract: contractAddress,
			}
		} else {
			throw new Error("ItemId or CollectionId must be assigned")
		}

		const collection = await this.sdk.apis.nftCollection.getNftCollectionById({
			collection: contractAddress,
		})

		const bidAction = this.sdk.order.bid
			.before(async (request: OrderCommon.OrderRequest) => {
				validateOrderDataV3Request(request, { shouldProvideMaxFeesBasePoint: false })

				const expirationDate = request.expirationDate instanceof Date
					? Math.floor(request.expirationDate.getTime() / 1000)
					: undefined
				const currencyAssetType = getCurrencyAssetType(request.currency)

				const payouts = common.toEthereumParts(request.payouts)
				const originFees = common.toEthereumParts(request.originFees)

				return {
					type: "DATA_V3_BUY",
					makeAssetType: common.getEthTakeAssetType(currencyAssetType),
					takeAssetType: takeAssetType,
					amount: request.amount,
					priceDecimal: request.price,
					payout: payouts[0],
					originFeeFirst: originFees[0],
					originFeeSecond: originFees[1],
					marketplaceMarker: this.config?.marketplaceMarker ? toWord(this.config?.marketplaceMarker) : undefined,
					end: expirationDate,
				}
			})
			.after((order) => common.convertEthereumOrderHash(order.hash, this.blockchain))

		const submit = Action.create({
			id: "convert" as const,
			run: async (request: OrderCommon.OrderRequest) => {
				const wethContractAddress = this.getWethContractAddress()
				const currency = getCurrencyAssetType(request.currency)
				if (currency["@type"] === "ERC20" && currency.contract.toLowerCase() === wethContractAddress.toLowerCase()) {
					const originFeesSum = request.originFees?.reduce((acc, fee) => fee.value, 0) || 0
					const value = await this.getConvertableValueCommon(
						currency,
						request.price,
						request.amount,
						originFeesSum
					)
					await this.convertCurrency(value)
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
			getConvertableValue: this.getConvertableValue,
			supportsExpirationDate: true,
			submit,
		}
	}

	getConvertMap() {
		const convertMap: Record<ContractAddress, string> = {}
		const wethAddress = this.sdk.balances.getWethContractAddress()
		if (wethAddress) {
			convertMap[convertEthereumContractAddress(wethAddress, this.blockchain)] = "ETH"
		}
		return convertMap
	}

	private async getConvertableValue(request: GetConvertableValueRequest): Promise<GetConvertableValueResult> {
		const convertMap = this.getConvertMap()
		let assetType: AssetType
		if (request.assetType) {
			assetType = request.assetType
		} else if (request.currencyId) {
			assetType = getCurrencyAssetType(request.currencyId)
		} else {
			throw new Error("assetType or currencyId should be specified")
		}
		if (assetType["@type"] === "ERC20" && assetType.contract in convertMap) {
			const originFeesSum = request.originFees.reduce((acc, fee) => fee.value, 0)
			return this.getConvertableValueCommon(assetType, request.price, request.amount, originFeesSum)
		}

		return undefined
	}

	async getConvertableValueCommon(
		assetType: RequestCurrencyAssetType, price: BigNumberValue, amount: number, originFeesSum: number
	) {
		if (!this.wallet) {
			throw new Error("Wallet is undefined")
		}
		const convertedAssetType = convertToEthereumAssetType(assetType)
		const value = new BigNumber(price).multipliedBy(amount)
		const convertedPrice = await getPrice(this.wallet.ethereum, convertedAssetType, value)

		const baseFee = await this.sdk.order.getBaseOrderFee()
		const completeFee = originFeesSum + baseFee
		const valueWithFee = addFee(
			{ assetType: convertedAssetType, value: toBigNumber(convertedPrice.toString()) },
			new BigNumber(completeFee)
		)
		const assetDecimals = await getDecimals(this.wallet.ethereum, convertedAssetType)
		const finishValue = new BigNumber(valueWithFee.value)
			.integerValue()
			.div(new BigNumber(10).pow(assetDecimals))
		const walletAddress = await this.wallet.ethereum.getFrom()

		return getCommonConvertableValue(
			this.balanceService.getBalance,
			convertEthereumToUnionAddress(walletAddress, Blockchain.ETHEREUM),
			new BigNumber(finishValue),
			{ "@type": "ETH", blockchain: this.blockchain },
			assetType,
		)
	}

	async convertCurrency(convertableValue: GetConvertableValueResult): Promise<void> {
		const wethContract = this.getWethContractAddress()
		if (!this.wallet) {
			throw new Error("Wallet is undefined")
		}

		if (convertableValue === undefined) {
			return
		}
		if (convertableValue.type === "insufficient") {
			throw new Error("Insufficient ETH funds")
		}

		if (convertableValue.type === "convertable") {
			const tx = await this.sdk.balances.convert(
				convertToEthereumAssetType({ "@type": "ETH" }),
				convertToEthereumAssetType({ "@type": "ERC20", contract: wethContract }),
				convertableValue.value
			)
			await tx.wait()
		}
	}

	async update(
		prepareRequest: OrderCommon.PrepareOrderUpdateRequest,
	): Promise<PrepareBidUpdateResponse> {
		if (!prepareRequest.orderId) {
			throw new Error("OrderId has not been specified")
		}
		const [blockchain, hash] = prepareRequest.orderId.split(":")
		if (!isEVMBlockchain(blockchain)) {
			throw new Error("Not an ethereum order")
		}

		const order = await this.sdk.apis.order.getOrderByHash({ hash })
		if (order.type !== "RARIBLE_V2" && order.type !== "RARIBLE_V1") {
			throw new Error(`Unable to update bid ${JSON.stringify(order)}`)
		}

		const bidUpdateAction = this.sdk.order.bidUpdate
			.before((request: OrderCommon.OrderUpdateRequest) => ({
				orderHash: toWord(hash),
				priceDecimal: request.price,
			}))
			.after((order) => common.convertEthereumOrderHash(order.hash, this.blockchain))

		const sellUpdateAction = Action.create({
			id: "convert" as const,
			run: async (request: OrderCommon.OrderUpdateRequest) => {
				const wethContractAddress = convertToEthereumAddress(this.getWethContractAddress())

				if (order.make.assetType.assetClass === "ERC20" && order.make.assetType.contract.toLowerCase() === wethContractAddress.toLowerCase()) {
					const value = await this.getConvertableValueCommon(
						this.convertAssetType(order.make.assetType) as RequestCurrencyAssetType,
						request.price,
						parseInt(order.take.value),
						getOrderFeesSum(order)
					)
					await this.convertCurrency(value)
				}

				return request
			},
		}).thenAction(bidUpdateAction)

		return {
			originFeeSupport: getOriginFeeSupport(order.type),
			payoutsSupport: getPayoutsSupport(order.type),
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportedCurrencies: common.getSupportedCurrencies(Blockchain.ETHEREUM, true),
			baseFee: await this.sdk.order.getBaseOrderFee(order.type),
			getConvertableValue: this.getConvertableValue,
			submit: sellUpdateAction,
		}
	}
}
