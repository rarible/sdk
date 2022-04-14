import { SolanaWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../../index"
import { LogsLevel } from "../../../domain"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"

describe("Solana collection", () => {
	const wallet = getWallet()
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "dev", { logs: LogsLevel.DISABLED })

	test("Should create an colection", async () => {
		const res = await sdk.nft.createCollection({
			blockchain: Blockchain.SOLANA,
			asset: {
				arguments: {
					metadataURI: "https://gist.githubusercontent.com/rzcoder/757f644f9755acb00aa8c34b619eb2a8/raw/ab18b90681643279c63ed96a666c622700bf30aa/konosuba",
				},
			},
		})

		res.tx.wait()
		const collection = await retry(10, 4000, () =>
			sdk.apis.collection.getCollectionById({ collection: res.address }),
		)

		expect(collection).toBeTruthy()
	})
})
