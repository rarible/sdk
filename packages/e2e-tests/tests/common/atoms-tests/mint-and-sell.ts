import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { Order } from "@rarible/api-client"
import { toBigNumber } from "@rarible/types"
import type { OrderRequest, PrepareOrderRequest } from "@rarible/sdk/src/types/order/common"
import { awaitOrderStock } from "../helpers"
import { PrepareMintRequest } from "@rarible/sdk/src/types/nft/mint/prepare-mint-request.type";
import { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type";
import { MintResponse } from "@rarible/sdk/build/types/nft/mint/domain";
import { Item } from "@rarible/api-client";
import { MintType } from "@rarible/sdk/src/types/nft/mint/domain";
import { retry } from "@rarible/sdk/src/common/retry";
import { MintAndSellRequest, MintAndSellResponse } from "@rarible/sdk/build/types/nft/mint-and-sell/domain";

/**
 * Mint and sell NFT and check stock
 */
export async function mintAndSell(sdk: IRaribleSdk,
													 wallet: BlockchainWallet,
													 prepareMintRequest: PrepareMintRequest,
													 mintAndSellRequest: MintAndSellRequest): Promise<MintAndSellResponse> {
	console.log("Minting token, prepare_mint_request=", prepareMintRequest)
	// Get mint info
	const prepareMintAndSellResponse = await sdk.nft.mintAndSell(prepareMintRequest)

	console.log("mint_and_sell_request=", mintAndSellRequest)
	// Mint token
	const mintAndSellResponse = await prepareMintAndSellResponse.submit(mintAndSellRequest)
	console.log("mint_and_sell_response", mintAndSellResponse)
	if (mintAndSellResponse.type === MintType.ON_CHAIN) {
		mintAndSellResponse.transaction.wait()
	}
	expect(mintAndSellResponse.itemId).not.toBe(null)
	await awaitOrderStock(sdk, mintAndSellResponse.orderId, toBigNumber(mintAndSellRequest.supply.toString()))
	return mintAndSellResponse
}
