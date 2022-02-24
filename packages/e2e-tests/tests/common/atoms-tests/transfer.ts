import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import { TransferRequest, PrepareTransferRequest } from "@rarible/sdk/build/types/nft/transfer/domain";
import { awaitForItemSupply } from "../helpers"
import type { BigNumber } from "@rarible/types";

/**
 * Transfer NFT
 */
export async function transfer(sdk: IRaribleSdk,
													 prepareTransferRequest: PrepareTransferRequest,
													 transferRequest: TransferRequest) {
	console.log("transfer_request=", transferRequest)
	// Prepare transfer
	const prepareTransferResponse = await sdk.nft.transfer(prepareTransferRequest)

	// Submit transfer
	await prepareTransferResponse.submit(transferRequest)

}
