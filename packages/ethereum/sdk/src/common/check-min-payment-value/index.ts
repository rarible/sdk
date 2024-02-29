import type { Asset, AssetType } from "@rarible/ethereum-api-client"
import { toBn } from "@rarible/utils"
import type { OrderForm } from "@rarible/ethereum-api-client"
import { Warning } from "@rarible/logger/build"
import type { Ethereum } from "@rarible/ethereum-provider"
import { isETHAssetType, isErc20AssetType, isNftAssetType } from "../asset-types"
import { getDecimals } from "../get-price/get-decimals"

export const MIN_PAYMENT_VALUE = toBn("0.0001")

export async function checkGreaterThanMinPaymentValue(ethereum: Ethereum, asset: Asset): Promise<void> {
	if (isETHAssetType(asset.assetType) || isErc20AssetType(asset.assetType)) {
		const minValueCents = await getMinPaymentValueCents(ethereum, asset.assetType)
		if (toBn(asset.value).lt(minValueCents)) {
			throw new Warning(`Asset value must be greater or equal to ${MIN_PAYMENT_VALUE.toFixed()}`)
		}
	}
}

export async function getMinPaymentValueCents(ethereum: Ethereum, type: AssetType) {
	const decimals = await getDecimals(ethereum, type)
	return MIN_PAYMENT_VALUE.multipliedBy(toBn(10).pow(decimals))
}

type PartialOrderForm = Pick<OrderForm, "make" | "take">

export async function checkMinPaymentValue<T extends PartialOrderForm>(ethereum: Ethereum, order: T): Promise<void> {
	if (isNftAssetType(order.make.assetType)) {
		// If make is an NFT then take probably is a erc20 or eth
		await checkGreaterThanMinPaymentValue(ethereum, order.take)
	}
	if (isNftAssetType(order.take.assetType)) {
		await checkGreaterThanMinPaymentValue(ethereum, order.make)
	}
}
