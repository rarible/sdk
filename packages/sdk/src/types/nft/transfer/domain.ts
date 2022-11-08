import type { ItemId } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { BigNumber } from "@rarible/types/build/big-number"
import type { AbstractPrepareResponse } from "../../../common/domain"

/**
 * Identifier of the minted item
 * @property {ItemId} itemId - item id
 * @example
 * import { toItemId } from "@rarible/types"
 * const itemId = toItemId("ETHEREUM:0x395d7e3a4c0cc8fb8d19dcd0b010da43a7a98c9b:44188")
 */
export type PrepareTransferRequest = {
	itemId: ItemId
}

/**
 * Transfer request
 * @property {UnionAddress} to - Recipient NFT address
 * @property {number} [amount] - Number of NFTs to transfer
 * @example
 * import { toUnionAddress } from "@rarible/types"
 * const request = {
 *   to: toUnionAddress("ETHEREUM:0x395d7e3a4c0cc8fb8d19dcd0b010da43a7a98c9b")
 *   amount: 1
 * }
 */
export interface TransferRequest {
	to: UnionAddress
	amount?: number
}

/**
 * @property {boolean} multiple - Is supports multiple values
 * @property {BigNumber} maxAmount - Max available amount to transfer
 * @property {function} submit: ({to: {@link UnionAddress}, amount?: number}) =>
 * {@link Promise} {@link IBlockchainTransaction}</p>
 */
export interface PrepareTransferResponse extends AbstractPrepareResponse<"transfer", TransferRequest, IBlockchainTransaction>{
	/**
   * Is supports multiple values
   */
	multiple: boolean

	/**
   * Maximum amount to transfer NFT
   */
	maxAmount: BigNumber
}

/**
 * Transfer asset to recipient
 * -
 * @param request - {itemId: ItemId}
 * @returns {Promise<PrepareTransferResponse>} response - {
 *   <p>multiple: boolean</p>
 *   <p>maxAmount: {@link BigNumber}</p>
 *   <p>submit: ({to: {@link UnionAddress}, amount?: number}) => Promise<IBlockchainTransaction></p>
 * <p>}</p>
 *
 * @example
 * const prepareTransfer = await sdk.nft.transfer({itemId: "ETHEREUM:..."})
 * const tx = prepareTransfer.submit({to: "ETHEREUM:0x...", amount: 1})
 *
 */
export type ITransferPrepare = (request: PrepareTransferRequest) => Promise<PrepareTransferResponse>
