import type { BigNumber } from "@rarible/types"
import { toBigNumber } from "@rarible/types/build/big-number"
import type { NftItemRoyalty } from "@rarible/ethereum-api-client/build/models/NftItemRoyalty"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import { toBn } from "@rarible/utils/build/bn"
import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum, EthereumSendOptions } from "@rarible/ethereum-provider"
import { BigNumber as BigNum } from "@rarible/utils"
import type { Part } from "@rarible/ethereum-api-client"
import type { AmmOrderFillRequest } from "../types"
import type { ExchangeWrapperOrderType } from "../types"
import { getRequiredWallet } from "../../../common/get-required-wallet"
import { ADDITIONAL_DATA_STRUCT } from "../../contracts/exchange-wrapper"
import type { RaribleEthereumApis } from "../../../common/apis"
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
	apis: RaribleEthereumApis,
	{ request, fillData, marketId, feeValue }: GetMarketDataRequest
) {
	const provider = getRequiredWallet(ethereum)

	const { totalFeeBasisPoints, encodedFeesValue, feeAddresses } = originFeeValueConvert(request.originFees)
	let valueWithOriginFees = calcValueWithFees(toBigNumber(fillData.options.value?.toString() ?? "0"), totalFeeBasisPoints)

	const data = {
		// marketId: ExchangeWrapperOrderType.AAM,
		marketId,
		amount: fillData.options.value ?? "0",
		fees: feeValue ?? encodedFeesValue,
		data: fillData.data,
	}
	if (request.addRoyalty && request.assetType) {
		let royalties = await getAmmItemsRoyalties(apis, request)

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
			valueWithOriginFees = toBn(valueWithOriginFees.plus(royaltiesAmount).toFixed())

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
			value: valueWithOriginFees.toFixed(),
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

export function addFeeDependsOnExternalFee(originFees?: Part[], externalFee?: BigNumber): BigNumber {
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
	royalties: NftItemRoyalty[],
	data: string,
	provider: Ethereum,
}) {
	const dataForEncoding = {
		data,
		additionalRoyalties: royalties.map(
			royalty => encodeBasisPointsPlusAccount(royalty.value, royalty.account)
		),
	}
	console.log("dataForEncoding", JSON.stringify(dataForEncoding, null, "  "))
	return provider.encodeParameter(ADDITIONAL_DATA_STRUCT, dataForEncoding)
}

export async function getAmmItemsRoyalties(
	apis: RaribleEthereumApis,
	request: AmmOrderFillRequest
): Promise<NftItemRoyalty[]> {
	if (!request.assetType) {
		return []
	}
	if (Array.isArray(request.assetType)) {
		//bulk getting royalties
		const itemsRoyalties = await Promise.all(
			request.assetType.map(async asset => {
				const royaltyList = await apis.nftItem.getNftItemRoyaltyById({
					itemId: `${asset.contract}:${asset.tokenId}`,
				})
				return royaltyList.royalty || []
			})
		)
		return itemsRoyalties.flat()
	} else {
		return (await apis.nftItem.getNftItemRoyaltyById({
			itemId: `${request.assetType.contract}:${request.assetType.tokenId}`,
		})).royalty || []
	}
}
