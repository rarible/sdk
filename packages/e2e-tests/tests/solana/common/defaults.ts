import { Blockchain } from "@rarible/api-client"
import type { CreateCollectionRequestSimplified } from "@rarible/sdk/node/types/nft/deploy/simplified"

export const deployCollectionDeployRequest: CreateCollectionRequestSimplified = {
	blockchain: Blockchain.SOLANA,
	metadataURI: "https://gist.githubusercontent.com/rzcoder/757f644f9755acb00aa8c34b619eb2a8/raw/ab18b90681643279c63ed96a666c622700bf30aa/konosuba",
}
