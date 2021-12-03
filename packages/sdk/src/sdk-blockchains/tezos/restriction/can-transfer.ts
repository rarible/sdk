import type { ItemId, UnionAddress } from "@rarible/types"
import type { CanTransferResult } from "../../../types/nft/restriction/domain"
import { convertUnionAddress } from "../common"

const url = "https://hangzhounet.smartpy.io/chains/main/blocks/head/helpers/scripts/run_view"

export async function canTransfer(
	itemId: ItemId, from: UnionAddress, to: UnionAddress,
): Promise<CanTransferResult> {
	const parsed = itemId.split(":")
	const contract = parsed[1]
	const tokenId = parsed[2]
	const body = {
		"chain_id": "NetXZSsxBpMQeAT",
		"contract": contract,
		"entrypoint": "can_transfer",
		"gas": "100000",
		"input": {
			"prim": "Pair",
			"args": [
				{ "int": tokenId },
				{
					"prim": "Pair",
					"args": [
						{ "string": "KT1AguExF32Z9UEKzD5nuixNmqrNs1jBKPT8" },
						{ "string": convertUnionAddress(from) },
						{ "string": convertUnionAddress(to) },
					],
				},
			],
		},
		"payer": "KT1AguExF32Z9UEKzD5nuixNmqrNs1jBKPT8",
		"source": "KT1AguExF32Z9UEKzD5nuixNmqrNs1jBKPT8",
		"unparsing_mode": "Readable",
	}
	console.log("body is", JSON.stringify(body))
	const response = await window.fetch(url, {
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	})
	const result: CheckResponse = await response.json()
	console.log("result is", JSON.stringify(result))
	if (result.data.string === "") {
		return { success: true }
	}
	return { success: false, reason }
}

const reason = "Ubisoft Quartz NFTs are only available to Ubisoft players.\n" +
  "Please read [Ubisoft Quartz’s FAQ](https://quartz.ubisoft.com/faq/) for more information."

type ERROR_CODE = "FROM_RESTRICTED" | "TO_RESTRICTED" | "TO_NOT_ALLOWED" | "BAD_TOKEN_ID" | "ARCHETYPE_QUOTA_REACHED"
| "ARCHOWNER_NOT_SET" | "ARCHLEDGER_NOT_SET" | "WHITELIST_ERROR"
type CheckResponse = {
	data: { string: "" | ERROR_CODE }
}
