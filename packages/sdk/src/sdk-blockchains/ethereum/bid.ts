import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { Address, ContractAddress } from "@rarible/types"
import { toBinary, toContractAddress, toUnionAddress, toWord } from "@rarible/types"
import { toBigNumber } from "@rarible/types/build/big-number"
import type * as EthereumApiClient from "@rarible/ethereum-api-client"
import type * as ApiClient from "@rarible/api-client"
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
import type * as OrderCommon from "../../types/order/common"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { GetConvertableValueResult, PrepareBidRequest, PrepareBidResponse } from "../../types/order/bid/domain"
import type { GetConvertableValueRequest } from "../../types/order/bid/domain"
import { getCommonConvertableValue } from "../../common/get-convertable-value"
import type { ConvertCurrencyRequest } from "../../types/order/bid/domain"
import * as common from "./common"
import type {
	EVMBlockchain } from "./common"
import {
	convertEthereumContractAddress,
	convertEthereumUnionAddress,
	convertToEthereumAddress,
	convertToEthereumAssetType,
	getEthereumItemId,
	getEVMBlockchain, getOrderFeesSum, getOriginFeesSum,
	isEVMBlockchain, toEthereumParts,
} from "./common"
import type { EthereumBalance } from "./balance"

export class EthereumBid {
	private readonly blockchain: EVMBlockchain

	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private balanceService: EthereumBalance,
		private network: EthereumNetwork,
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

	getAsset(asset: EthereumApiClient.Asset): ApiClient.Asset {
		return {
			type: this.convertAssetType(asset.assetType),
			value: asset.value,
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
				return {
					makeAssetType: common.getEthTakeAssetType(request.currency),
					takeAssetType: takeAssetType,
					amount: request.amount,
					priceDecimal: request.price,
					payouts: common.toEthereumParts(request.payouts),
					originFees: common.toEthereumParts(request.originFees),
				}
			})
			.after((order) => common.convertEthereumOrderHash(order.hash, this.blockchain))

		const submit = Action.create({
			id: "convert" as const,
			run: async (request: OrderCommon.OrderRequest) => {
				const wethContractAddress = this.getWethContractAddress()
				if (request.currency["@type"] === "ERC20" && request.currency.contract === wethContractAddress) {
					await this.convertCurrency({
						price: request.price,
						fee: getOriginFeesSum(
							toEthereumParts(request.originFees)
						),
					})
				}
				return request
			},
		}).thenAction(bidAction)

		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportedCurrencies: common.getSupportedCurrencies(),
			multiple: collection.type === "ERC1155",
			maxAmount: item ? item.supply : null,
			baseFee: await this.sdk.order.getBaseOrderFee(),
			getConvertableValue: this.getConvertableValue,
			submit,
		}
	}

	getConvertMap() {
		return {
			[convertEthereumUnionAddress(this.sdk.balances.getWethContractAddress(), this.blockchain)]: "ETH",
		}
	}

	private async getConvertableValue(request: GetConvertableValueRequest): Promise<GetConvertableValueResult> {
		const convertMap = this.getConvertMap()

		if (request.assetType["@type"] === "ERC20" && request.assetType.contract in convertMap) {
			if (!this.wallet) {
				throw new Error("Wallet is undefined")
			}

			const convertedAssetType = convertToEthereumAssetType(request.assetType)
			const convertedPrice = await getPrice(this.wallet.ethereum, convertedAssetType, request.value)
			const valueWithFee = addFee(
				{ assetType: convertedAssetType, value: toBigNumber(convertedPrice.toString()) },
				request.fee
			)
			const assetDecimals = await getDecimals(this.wallet.ethereum, convertedAssetType)
			const finishValue = new BigNumber(valueWithFee.value)
				.integerValue()
				.div(new BigNumber(10).pow(assetDecimals))
			return getCommonConvertableValue(
				this.balanceService.getBalance,
				request.walletAddress,
				new BigNumber(finishValue),
				{ "@type": "ETH" },
				request.assetType,
			)
		}

		return undefined
	}

	async convertCurrency(request: ConvertCurrencyRequest): Promise<void> {
		const wethContract = this.getWethContractAddress()
		if (!this.wallet) {
			throw new Error("Wallet is undefined")
		}

		const convertableValue = await this.getConvertableValue({
			assetType: { "@type": "ERC20", contract: wethContract },
			value: request.price,
			walletAddress: toUnionAddress(`ETHEREUM:${await this.wallet.ethereum.getFrom()}`),
			fee: request.fee,
		})

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

	getOrderFee() {}
	async update(
		prepareRequest: OrderCommon.PrepareOrderUpdateRequest,
	): Promise<OrderCommon.PrepareOrderUpdateResponse> {
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
				await this.convertCurrency({
					price: request.price,
					fee: getOrderFeesSum(order),
				})
				return request
			},
		}).thenAction(bidUpdateAction)

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
