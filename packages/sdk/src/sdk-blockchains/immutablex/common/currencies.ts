import { Blockchain } from "@rarible/api-client"
import type { CurrencyType } from "../../../common/domain"

export function getCurrencies(): CurrencyType[] {
  return [
    { blockchain: Blockchain.ETHEREUM, type: "NATIVE" },
    { blockchain: Blockchain.ETHEREUM, type: "ERC20" },
  ]
}
