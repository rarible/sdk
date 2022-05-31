import { toCollectionId } from "@rarible/types"
import type { Item } from "@rarible/api-client/build/models"
import { MintType } from "../../../../types/nft/mint/domain"
import type { IRaribleSdk } from "../../../../domain"
import { retry } from "../../../../common/retry"

export async function mintToken(sdk: IRaribleSdk): Promise<Item> {
	const mint = await sdk.nft.mint({
		collectionId: toCollectionId("SOLANA:Ev9n3xAfCrxPrUSUN4mLorwfaknjj4QMcyLUnbPymSmJ"),
	})

	const mintRes = await mint.submit({
		supply: 0,
		lazyMint: false,
		uri: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
	})

	if (mintRes.type === MintType.ON_CHAIN) {
		await mintRes.transaction.wait()
	}

	return await retry(
		10,
		2000,
		async () => await sdk.apis.item.getItemById({ itemId: mintRes.itemId })
	)
}
