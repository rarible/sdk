import type { Asset } from "@rarible/ethereum-api-client"
import { BigNumber, toBn } from "@rarible/utils"
import type { OrderForm } from "@rarible/ethereum-api-client"
import { Warning } from "@rarible/logger/build"
import { isETH, isRari, isWeth } from "../nft/common"
import type { EthereumConfig } from "../config/type"
import { isNft } from "../order/is-nft"
import { ETHER_IN_WEI } from "./index"

export function checkGreaterThanMinPaymentValue({ assetType, value }: Asset, config: EthereumConfig): void {
	if ((isETH(assetType) || isWeth(assetType, config) || isRari(assetType, config))
    && !toBn(value).gte(minPaymentValue)) {
		throw new Warning(`Asset value must be less or equal to ${minPaymentValue.div(ETHER_IN_WEI).toFixed()}`)
	}
}

// Min value 0.0001 in ETH/Rari/Weth on listing/bidding
const minPaymentValue = new BigNumber(10).pow(14)

export function checkMinPaymentValue(checked: OrderForm, config: EthereumConfig): void {
	if (isNft(checked.make.assetType)) {
		checkGreaterThanMinPaymentValue(checked.take, config)
	} else if (isNft(checked.take.assetType)) {
		checkGreaterThanMinPaymentValue(checked.make, config)
	}
}
