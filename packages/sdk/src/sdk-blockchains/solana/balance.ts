import type { UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import type { SolanaSdk } from "@rarible/solana-sdk"
import type { SolanaWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"
import type { RequestCurrency } from "../../common/domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import { extractPublicKey } from "./common/address-converters"
import type { ISolanaSdkConfig } from "./domain"

export class SolanaBalance {
	constructor(
		readonly sdk: SolanaSdk,
		readonly wallet: Maybe<SolanaWallet>,
		private readonly config: ISolanaSdkConfig | undefined,
	) {
		this.getBalance = this.getBalance.bind(this)
	}

	async getBalance(address: UnionAddress, currency: RequestCurrency): Promise<BigNumberValue> {
		const assetType = getCurrencyAssetType(currency)
		if (assetType["@type"] === "SOLANA_SOL") {
			return (await this.sdk.balances.getBalance(extractPublicKey(address), { commitment: "max" })).toString()
		} else if (assetType["@type"] === "SOLANA_NFT") {
			return (await this.sdk.balances.getTokenBalance(
				extractPublicKey(address),
				extractPublicKey(assetType.itemId)
			)).toString()
		} else {
			throw new Error("Unsupported asset type")
		}
	}
}
