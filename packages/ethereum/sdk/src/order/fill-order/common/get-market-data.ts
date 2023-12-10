import type { Address, BigNumber } from "@rarible/types"
import { toBigNumber } from "@rarible/types/build/big-number"
import type { NftItemRoyalty } from "@rarible/ethereum-api-client/build/models/NftItemRoyalty"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import { toBn } from "@rarible/utils/build/bn"
import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum, EthereumSendOptions } from "@rarible/ethereum-provider"
import { BigNumber as BigNum } from "@rarible/utils"
import type { Payout } from "@rarible/api-client/build/models/Payout"
import type { AmmOrderFillRequest } from "../types"
import type { ExchangeWrapperOrderType } from "../types"
import { getRequiredWallet } from "../../../common/get-required-wallet"
import { ADDITIONAL_DATA_STRUCT } from "../../contracts/exchange-wrapper"
import type { RaribleEthereumApis } from "../../../common/apis"
import { convertUnionPartsToEVM, convertUnionRoyalties, createUnionItemId } from "../../../common/union-converters"
import type { EthereumConfig } from "../../../config/type"
import type { CommonFillRequestAssetType } from "../types"
import {
	calcValueWithFees,
	encodeBasisPointsPlusAccount,
	getPackedFeeValue,
	originFeeValueConvert,
} from "./origin-fees-utils"

export type GetMarketDataRequest = {
	request: AmmOrderFillRequest,
	fillData: {
		data: string
		options: EthereumSendOptions
	},
	feeValue?: BigNumber,
	marketId: ExchangeWrapperOrderType
}

export async function getMarketData(
	ethereum: Maybe<Ethereum>,
	config: EthereumConfig,
	apis: RaribleEthereumApis,
	{ request, fillData, marketId, feeValue }: GetMarketDataRequest
) {
	const provider = getRequiredWallet(ethereum)

	const { totalFeeBasisPoints, encodedFeesValue, feeAddresses } = originFeeValueConvert(
		convertUnionPartsToEVM(request.originFees)
	)
	let valueWithOriginFees = calcValueWithFees(toBigNumber(fillData.options.value?.toString() ?? "0"), totalFeeBasisPoints)

	const data = {
		marketId,
		amount: fillData.options.value ?? "0",
		fees: feeValue ?? encodedFeesValue,
		data: fillData.data,
	}
	if (request.addRoyalty && request.assetType) {
		let royalties = await getAmmItemsRoyalties(apis, config, request)

		if (royalties?.length) {
			data.data = encodeDataWithRoyalties({
				royalties,
				data: fillData.data,
				provider,
			})
			const royaltiesAmount = getRoyaltiesAmount(
				royalties,
				fillData.options.value?.toString() ?? 0
			)
			valueWithOriginFees = toBn(valueWithOriginFees.plus(royaltiesAmount).toString())

			data.fees = addFeeDependsOnExternalFee(request.originFees, feeValue)
		}
	}

	return {
		originFees: {
			totalFeeBasisPoints,
			encodedFeesValue,
			feeAddresses,
		},
		data,
		options: {
			...fillData.options,
			value: valueWithOriginFees.toString(),
		},
	}
}

export function getRoyaltiesAmount(royalty: NftItemRoyalty[], value: BigNumberValue) {
	const royaltiesBasisPoints = royalty.reduce((acc, item) => {
		return acc += item.value
	}, 0)
	return toBn(royaltiesBasisPoints)
		.dividedBy(10000)
		.multipliedBy(value)
		.integerValue(BigNum.ROUND_FLOOR)
}

export function addFeeDependsOnExternalFee(originFees?: Payout[], externalFee?: BigNumber): BigNumber {
	if (externalFee) {
		//get first and second value with length=4 of each one
		return toBigNumber("0x1" + externalFee.toString().slice(-8).padStart(8, "0"))
	} else {
		const firstFee = getPackedFeeValue(originFees?.[0]?.value)
		const secondFee = getPackedFeeValue(originFees?.[1]?.value)
		if (firstFee.length > 4 || secondFee.length > 4) {
			throw new Error(`Decrease origin fees values: fee_1 = ${firstFee}, fee_2=${secondFee}`)
		}
		return toBigNumber("0x1" + firstFee + secondFee)
	}
}

export function encodeDataWithRoyalties({ royalties, data, provider }: {
	royalties: Array<{account: Address, value: number}>,
	data: string,
	provider: Ethereum,
}) {
	const dataForEncoding = {
		data,
		additionalRoyalties: royalties.map(
			royalty => encodeBasisPointsPlusAccount(royalty.value, royalty.account)
		),
	}
	return provider.encodeParameter(ADDITIONAL_DATA_STRUCT, dataForEncoding)
}

export async function getAmmItemsRoyalties(
	apis: RaribleEthereumApis,
	config: EthereumConfig,
	request: { assetType?: CommonFillRequestAssetType | CommonFillRequestAssetType[] }
): Promise<Array<{account: Address, value: number}>> {
	if (!request.assetType) {
		return []
	}
	if (Array.isArray(request.assetType)) {
		//bulk getting royalties
		const itemsRoyalties = await Promise.all(
			request.assetType.map(async asset => {

				return (await apis.nftItem.getItemRoyaltiesById({
					itemId: createUnionItemId(config.chainId, asset.contract, asset.tokenId),
				})).royalties.map(royalty => convertUnionRoyalties(royalty))
			})
		)
		return itemsRoyalties.flat()
	} else {
		return (await apis.nftItem.getItemRoyaltiesById({
			itemId: createUnionItemId(config.chainId, request.assetType.contract, request.assetType.tokenId),
		})).royalties.map(royalty => convertUnionRoyalties(royalty))
	}
}
