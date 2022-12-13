import type {
	TezosProvider,
} from "@rarible/tezos-sdk"
import { CollectionType } from "@rarible/api-client"
import axios from "axios"
import { handleAxiosErrorResponse, Warning } from "@rarible/logger/build"
import { NetworkErrorCode } from "../../../common/apis"
import type { MaybeProvider } from "./index"

export async function getCollectionType(
	provider: MaybeProvider<TezosProvider>, collection: string
): Promise<CollectionType.TEZOS_NFT | CollectionType.TEZOS_MT> {
	let response
	try {
		const { data } = await axios.get(`${provider.config.tzkt}/v1/contracts/${collection}/storage/schema`)
		response = data
	} catch (e) {
		console.error(e)
		handleAxiosErrorResponse(e, { code: NetworkErrorCode.TEZOS_EXTERNAL_ERR })
		throw new Error("Getting tezos collection data error")
	}

	if (!response) {
		throw new Warning(`Collection ${collection} has not been found on that network`)
	}
	const mtTag = "ledger:big_map:object:nat"
	const nftTag = "ledger:big_map_flat:nat:address"
	const schema = response["schema:object"]
	if (!schema) {
		throw new Error(`Schema has not been found for collection ${collection}`)
	}
	if (mtTag in schema || (schema["assets:object"] && mtTag in schema["assets:object"])) {
		return CollectionType.TEZOS_MT
	} else if (nftTag in schema || (schema["assets:object"] && nftTag in schema["assets:object"])) {
		return CollectionType.TEZOS_NFT
	} else {
		throw new Error("Unrecognized tezos collection")
	}
}
