import type { ItemId, UnionAddress } from "@rarible/types"
import type { TezosProvider } from "@rarible/tezos-sdk"
import type { CanTransferResult } from "../../../types/nft/restriction/domain"
import type { MaybeProvider } from "../common"
import { convertUnionAddress, getRequiredProvider } from "../common"

export class TezosCanTransfer {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
	) {
		this.canTransfer = this.canTransfer.bind(this)
	}

	async canTransfer(
		itemId: ItemId, from: UnionAddress, to: UnionAddress,
	): Promise<CanTransferResult> {
		const provider = getRequiredProvider(this.provider)
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
							{ "string": convertUnionAddress(from) },
							{ "string": convertUnionAddress(to) },
						],
					},
				],
			},
			"payer": this.provider.config.transfer_proxy,
			"source": this.provider.config.transfer_proxy,
			"unparsing_mode": "Readable",
		}
		const response = await window.fetch(
			`${provider.tezos.tk.rpc.getRpcUrl()}/chains/main/blocks/head/helpers/scripts/run_view`,
			{
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			})
		const result: CheckResponse = await response.json()
		if (result.data.string === "") {
			return { success: true }
		}
		return { success: false, reason: getReasonMessage(result.data.string) }
	}
}

const REASONS_MESSAGES: Record<string, string> = {
	"ARCHETYPE_QUOTA_REACHED": "You have reached the maximum amount of Digits you can own of this Edition, " +
    "please visit [quartz.ubisoft.com](https://quartz.ubisoft.com) for more information.",
	"TO_RESTRICTED": "You can't trade this Digit at the moment, please visit " +
    "[quartz.ubisoft.com](https://quartz.ubisoft.com) for more information.",
}

function getReasonMessage(code: ERROR_CODE | string): string {
	if (!(code in REASONS_MESSAGES)) {
		return REASONS_MESSAGES["TO_RESTRICTED"]
	}
	return REASONS_MESSAGES[code]
}

type ERROR_CODE = "FROM_RESTRICTED" | "TO_RESTRICTED" | "TO_NOT_ALLOWED" | "BAD_TOKEN_ID" | "ARCHETYPE_QUOTA_REACHED"
| "ARCHOWNER_NOT_SET" | "ARCHLEDGER_NOT_SET" | "WHITELIST_ERROR"
type CheckResponse = {
	data: { string: "" | ERROR_CODE }
}
