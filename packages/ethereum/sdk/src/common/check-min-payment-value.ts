import type { Asset, OrderForm } from "@rarible/ethereum-api-client"
import { BigNumber } from "@rarible/utils"
import { Warning } from "@rarible/logger/build"
import type { Ethereum } from "@rarible/ethereum-provider"
import { isErc20, isETH } from "../nft/common"
import { isNft } from "../order/is-nft"
import { getPriceDecimal } from "./get-price"
import { ETHER_IN_WEI, HBAR_IN_TINYBAR, isHederaEvm } from "./index"

export async function checkGreaterThanMinPaymentValue(ethereum: Ethereum, { assetType, value }: Asset): Promise<void> {
  const priceDecimal = await getPriceDecimal(ethereum, assetType, value)

  let minimalValue = MIN_PAYMENT_VALUE_DECIMAL

  if (await isHederaEvm(ethereum)) {
    minimalValue = MIN_PAYMENT_VALUE_DECIMAL_HBAR
  }
  if ((isETH(assetType) || isErc20(assetType)) && !priceDecimal.gte(minimalValue) && !priceDecimal.eq(0)) {
    throw new Warning(`Asset value must be greater or equal to ${minimalValue.toFixed()}`)
  }
}

// Min value 0.0001 in ETH/Rari/Weth on listing/bidding
export const MIN_PAYMENT_VALUE = new BigNumber(10).pow(12)
export const MIN_PAYMENT_VALUE_DECIMAL = MIN_PAYMENT_VALUE.div(ETHER_IN_WEI)
// Min value 0.001 in HBAR (or 10_000_000_000 in tinybar)
export const MIN_PAYMENT_VALUE_HBAR = new BigNumber(10).pow(4)
export const MIN_PAYMENT_VALUE_DECIMAL_HBAR = MIN_PAYMENT_VALUE_HBAR.div(HBAR_IN_TINYBAR)

export async function checkMinPaymentValue(ethereum: Ethereum, checked: OrderForm): Promise<void> {
  if (isNft(checked.make.assetType)) {
    await checkGreaterThanMinPaymentValue(ethereum, checked.take)
  } else if (isNft(checked.take.assetType)) {
    await checkGreaterThanMinPaymentValue(ethereum, checked.make)
  }
}
