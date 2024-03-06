import { retry } from "../../common/retry"
import type { RaribleEthereumApis } from "../../common/apis"

export async function awaitForCollection(apis: RaribleEthereumApis, collection: string) {
	return retry(20, 3000, async () => {
		return await apis.nftCollection.getNftCollectionById({
			collection,
		})
	})
}
