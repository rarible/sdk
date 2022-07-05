import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { toBigNumber } from "@rarible/types"
import type { PrepareMintRequest } from "@rarible/sdk/src/types/nft/mint/prepare-mint-request.type"
import { MintType } from "@rarible/sdk/src/types/nft/mint/domain"
import type { MintAndSellRequest, MintAndSellResponse } from "@rarible/sdk/build/types/nft/mint-and-sell/domain"
import { awaitOrderStock } from "../helpers"
import { Logger } from "../logger"

/**
 * Mint and sell NFT and check stock
 */
export async function mintAndSell(sdk: IRaribleSdk,
													 wallet: BlockchainWallet,
													 prepareMintRequest: PrepareMintRequest,
													 mintAndSellRequest: MintAndSellRequest): Promise<MintAndSellResponse> {
	Logger.log("Minting token, prepare_mint_request=", prepareMintRequest)
	// Get mint info
	const prepareMintAndSellResponse = await sdk.nft.mintAndSell(prepareMintRequest)

	Logger.log("mint_and_sell_request=", mintAndSellRequest)
	// Mint token
	const mintAndSellResponse = await prepareMintAndSellResponse.submit(mintAndSellRequest)
	Logger.log("mint_and_sell_response", mintAndSellResponse)
	if (mintAndSellResponse.type === MintType.ON_CHAIN) {
		mintAndSellResponse.transaction.wait()
	}
	expect(mintAndSellResponse.itemId).not.toBe(null)
	await awaitOrderStock(sdk, mintAndSellResponse.orderId, toBigNumber(mintAndSellRequest.supply.toString()))
	return mintAndSellResponse
}
