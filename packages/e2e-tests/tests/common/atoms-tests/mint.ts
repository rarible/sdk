import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import { MintType } from "@rarible/sdk/src/types/nft/mint/domain"
import { retry } from "@rarible/sdk/src/common/retry"
import type { PrepareMintRequest } from "@rarible/sdk/src/types/nft/mint/prepare-mint-request.type"
import type { MintResponse } from "@rarible/sdk/build/types/nft/mint/domain"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { Item } from "@rarible/api-client"
import { Logger } from "../logger"

/**
 * Mint NFT and check result
 */
export async function mint(
	sdk: IRaribleSdk,
	wallet: BlockchainWallet,
	prepareMintRequest: PrepareMintRequest,
	mintRequest: MintRequest
): Promise<{ mintResponse: MintResponse, nft: Item }> {
	Logger.log("Minting token, prepare_mint_request=", prepareMintRequest)
	// Get mint info
	const mintPrepare = await sdk.nft.mint(prepareMintRequest)
	// mintPrepare.supportsLazyMint

	Logger.log("mint_request=", mintRequest)
	// Mint token
	const mintResponse = await mintPrepare.submit(mintRequest)
	let mintType = mintRequest.lazyMint ? MintType.OFF_CHAIN : MintType.ON_CHAIN
	expect(mintResponse.type).toBe(mintType)

	if (mintResponse.type === MintType.ON_CHAIN) {
		const transaction = await mintResponse.transaction.wait()
		expect(transaction.blockchain).toEqual(wallet.blockchain)
		expect(transaction.hash).toBeTruthy()
	}

	// Wait until item appear
	const nft = await retry(15, 3000, async () => {
		const item = await sdk.apis.item.getItemById({ itemId: mintResponse.itemId })
		expect(parseInt(item.supply.toString())).toBeGreaterThanOrEqual(parseInt(mintRequest.supply.toString()))
		return item
	})

	expect(nft.id).toEqual(mintResponse.itemId)
	const response = { mintResponse, nft }
	Logger.log("mint response/nft", response)
	return response
}
