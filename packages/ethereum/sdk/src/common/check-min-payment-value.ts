import type { Asset } from "@rarible/ethereum-api-client"
import { BigNumber, toBn } from "@rarible/utils"
import type { OrderForm } from "@rarible/ethereum-api-client"
import { Warning } from "@rarible/logger/build"
import { isErc20, isETH } from "../nft/common"
import { isNft } from "../order/is-nft"
import { ETHER_IN_WEI } from "./index"

export function checkGreaterThanMinPaymentValue({ assetType, value }: Asset): void {
	if ((isETH(assetType) || isErc20(assetType))
    && !toBn(value).gte(MIN_PAYMENT_VALUE)) {
		throw new Warning(`Asset value must be greater or equal to ${MIN_PAYMENT_VALUE.div(ETHER_IN_WEI).toFixed()}`)
	}
}

// Min value 0.0001 in ETH/Rari/Weth on listing/bidding
export const MIN_PAYMENT_VALUE = new BigNumber(10).pow(14)
export const MIN_PAYMENT_VALUE_DECIMAL = MIN_PAYMENT_VALUE.div(ETHER_IN_WEI)

export function checkMinPaymentValue(checked: OrderForm): void {
	if (isNft(checked.make.assetType)) {
		checkGreaterThanMinPaymentValue(checked.take)
	} else if (isNft(checked.take.assetType)) {
		checkGreaterThanMinPaymentValue(checked.make)
	}
}
