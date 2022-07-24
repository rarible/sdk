import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { TransferRequest, PrepareTransferRequest } from "@rarible/sdk/build/types/nft/transfer/domain"

/**
 * Transfer NFT
 */
export async function transfer(sdk: IRaribleSdk,
													 prepareTransferRequest: PrepareTransferRequest,
													 transferRequest: TransferRequest) {
	console.log("transfer_request=", transferRequest)
	// Prepare transfer
	const prepareTransferResponse = await sdk.nft.transfer.prepare(prepareTransferRequest)

	// Submit transfer
	await prepareTransferResponse.submit(transferRequest)

}
