import type { ItemId, UnionAddress } from "@rarible/types"
import type { TezosProvider } from "tezos-sdk-module"
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
		return { success: false, reason }
	}
}

const reason = "Ubisoft Quartz NFTs are only available to Ubisoft players.\n" +
  "Please read [Ubisoft Quartz’s FAQ](https://quartz.ubisoft.com/faq/) for more information."

type ERROR_CODE = "FROM_RESTRICTED" | "TO_RESTRICTED" | "TO_NOT_ALLOWED" | "BAD_TOKEN_ID" | "ARCHETYPE_QUOTA_REACHED"
| "ARCHOWNER_NOT_SET" | "ARCHLEDGER_NOT_SET" | "WHITELIST_ERROR"
type CheckResponse = {
	data: { string: "" | ERROR_CODE }
}
