import type { OrderId } from "@rarible/api-client"
import type { MintRequest } from "../mint/mint-request.type"
import type { MintResponse } from "../mint/prepare"
import type { PrepareMintRequest } from "../mint/prepare-mint-request.type"
import type { OriginFeeSupport, PayoutsSupport } from "../../order/fill/domain"
import type { AbstractPrepareResponse, CurrencyType } from "../../../common/domain"
import type { OrderRequest } from "../../order/common"

export type MintAndSellRequest = MintRequest & Omit<OrderRequest, "amount">

export type MintAndSellResponse = MintResponse & {
  orderId: OrderId
}

export type PrepareMintAndSellResponse = AbstractPrepareResponse<
  "mint" | "convert" | "approve" | "sign" | "send-tx",
  MintAndSellRequest,
  MintAndSellResponse
> & {
  supportedCurrencies: CurrencyType[]
  baseFee: number
  originFeeSupport: OriginFeeSupport
  payoutsSupport: PayoutsSupport
  supportsRoyalties: boolean
  supportsLazyMint: boolean
}

/**
 * Mint token and create sell order from it
 * -
 * @param meta metadata request for prepare
 * @returns {Promise<PrepareMintAndSellResponse>}
 * @example
 * import { toUnionAddress } from "@rarible/types"
 *
 * const prepare = sdk.nft.mint({tokenId: toTokenId("ETHEREUM:0x...")})
 * const tx = prepare.submit({
 *		uri: "ipfs://...",
 *		supply: 1,
 *		lazyMint: false,
 *		creators?: [{account: toUnionAddress("ETHEREUM:0x..."), value: 100}],
 *		royalties?: [{account: toUnionAddress("ETHEREUM:0x..."), value: 100}],
 *		price: toBn("1"),
 *		currency: {"@type": "ETH"},
 *		originFees?: [{account: toUnionAddress("ETHEREUM:0x...")}],
 *		payouts?: [{account: toUnionAddress("ETHEREUM:0x...")}]
 *		expirationDate?: 1234567890
 * })
 */
export type IMintAndSellPrepare = (request: PrepareMintRequest) => Promise<PrepareMintAndSellResponse>
