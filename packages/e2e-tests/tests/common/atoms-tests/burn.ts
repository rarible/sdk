import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import { BurnRequest, PrepareBurnRequest } from "@rarible/sdk/build/types/nft/burn/domain";
import { awaitForItemSupply } from "../helpers"
import type { BigNumber } from "@rarible/types";

/**
 * Burn NFT and check result
 */
export async function burn(sdk: IRaribleSdk,
													 prepareBurnRequest: PrepareBurnRequest,
													 burnRequest: BurnRequest,
													 supply: string | number | BigNumber) {
	console.log("Burning token, prepare_burn_request=", prepareBurnRequest)
	// Prepare burn
	const prepareBurnResponse = await sdk.nft.burn(prepareBurnRequest)

	// Submit burn
	const burnTx = await prepareBurnResponse.submit(burnRequest)
	if (burnTx) {
		await burnTx.wait()
	}
	await awaitForItemSupply(sdk, prepareBurnRequest.itemId, supply)
}
