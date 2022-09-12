import type { CreateCollectionRequest } from "@rarible/sdk/src/types/nft/deploy/domain"
import { Blockchain } from "@rarible/api-client"

export const deployCollectionDeployRequest: CreateCollectionRequest = {
	blockchain: Blockchain.SOLANA,
	asset: {
		arguments: {
			metadataURI: "https://gist.githubusercontent.com/rzcoder/757f644f9755acb00aa8c34b619eb2a8/raw/ab18b90681643279c63ed96a666c622700bf30aa/konosuba",
		},
	},
}
