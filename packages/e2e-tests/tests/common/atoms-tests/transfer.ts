import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { TransferRequest, PrepareTransferRequest } from "@rarible/sdk/build/types/nft/transfer/domain"
import { Logger } from "../logger"

/**
 * Transfer NFT
 */
export async function transfer(sdk: IRaribleSdk,
													 prepareTransferRequest: PrepareTransferRequest,
													 transferRequest: TransferRequest) {
	Logger.log("transfer_request=", transferRequest)
	// Prepare transfer
	const prepareTransferResponse = await sdk.nft.transfer(prepareTransferRequest)

	// Submit transfer
	await prepareTransferResponse.submit(transferRequest)

}
