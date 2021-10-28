import { toAddress } from "@rarible/types"
import { RequestCurrency } from "../../../common/domain"

export function getEthTakeAssetType(currency: RequestCurrency) {
	switch (currency["@type"]) {
		case "ERC20": {
			return {
				assetClass: currency["@type"],
				contract: toAddress(currency.contract),
			}
		}
		case "ETH": {
			return {
				assetClass: currency["@type"],
			}
		}
		default: {
			throw Error("Invalid take asset type")
		}
	}
}
