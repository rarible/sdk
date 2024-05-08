import type { Asset } from "@rarible/ethereum-api-client"
import { BigNumber } from "@rarible/utils"
import type { OrderForm } from "@rarible/ethereum-api-client"
import { Warning } from "@rarible/logger/build"
import type { Ethereum } from "@rarible/ethereum-provider"
import { isErc20, isETH } from "../nft/common"
import { isNft } from "../order/is-nft"
import { getPriceDecimal } from "./get-price"
import { ETHER_IN_WEI } from "./index"

export async function checkGreaterThanMinPaymentValue(
	ethereum: Ethereum,
	{ assetType, value }: Asset
): Promise<void> {
	const priceDecimal = await getPriceDecimal(ethereum, assetType, value)

	if ((isETH(assetType) || isErc20(assetType))
    && !priceDecimal.gte(MIN_PAYMENT_VALUE_DECIMAL) && !priceDecimal.eq(0)) {
		throw new Warning(`Asset value must be greater or equal to ${MIN_PAYMENT_VALUE_DECIMAL.toFixed()}`)
	}
}

// Min value 0.0001 in ETH/Rari/Weth on listing/bidding
export const MIN_PAYMENT_VALUE = new BigNumber(10).pow(14)
export const MIN_PAYMENT_VALUE_DECIMAL = MIN_PAYMENT_VALUE.div(ETHER_IN_WEI)

export async function checkMinPaymentValue(ethereum: Ethereum, checked: OrderForm): Promise<void> {
	if (isNft(checked.make.assetType)) {
		await checkGreaterThanMinPaymentValue(ethereum, checked.take)
	} else if (isNft(checked.take.assetType)) {
		await checkGreaterThanMinPaymentValue(ethereum, checked.make)
	}
}
