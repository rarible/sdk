import type { TezosWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"
import type { ItemId, UnionAddress } from "@rarible/types"
import { notImplemented } from "../../common/not-implemented"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import type { CanTransferResult } from "../../types/nft/restriction/domain"
import { TezosSell } from "./sell"
import { TezosFill } from "./fill"
import { TezosBid } from "./bid"
import { convertUnionAddress, getMaybeTezosProvider, getTezosAPIs } from "./common"
import type { TezosNetwork } from "./domain"
import { TezosMint } from "./mint"
import { TezosTransfer } from "./transfer"
import { TezosBurn } from "./burn"
import { TezosTokenId } from "./token-id"
import { TezosCancel } from "./cancel"
import { TezosBalance } from "./balance"
import { TezosDeploy } from "./deploy"

export function createTezosSdk(
	wallet: Maybe<TezosWallet>,
	_apis: IApisSdk,
	network: TezosNetwork,
): IRaribleInternalSdk {
	const apis = getTezosAPIs(network)
	const maybeProvider = getMaybeTezosProvider(wallet?.provider, network)
	const mintService = new TezosMint(maybeProvider, apis)

	return {
		nft: {
			mint: mintService.mint,
			burn: new TezosBurn(maybeProvider, apis).burn,
			transfer: new TezosTransfer(maybeProvider, apis).transfer,
			generateTokenId: new TezosTokenId(maybeProvider, apis).generateTokenId,
			deploy: new TezosDeploy(maybeProvider, apis).deployToken,
			preprocessMeta: mintService.preprocessMeta,
		},
		order: {
			fill: new TezosFill(maybeProvider, apis).fill,
			sell: new TezosSell(maybeProvider, apis).sell,
			sellUpdate: notImplemented,
			bid: new TezosBid(maybeProvider, apis).bid,
			bidUpdate: notImplemented,
			cancel: new TezosCancel(maybeProvider, apis).cancel,
		},
		balances: {
			getBalance: new TezosBalance(maybeProvider, apis).getBalance,
		},
		restriction: { canTransfer },
	}
}

const url = "https://hangzhounet.smartpy.io/chains/main/blocks/head/helpers/scripts/run_view"

export async function canTransfer(
	itemId: ItemId, from: UnionAddress, to: UnionAddress,
): Promise<CanTransferResult> {
	const parsed = itemId.split(":")
	const tokenId = parsed[2]
	const body = {
		"chain_id": "NetXZSsxBpMQeAT",
		"contract": "KT1JfpeUECSWCNgCxdwof2nntxq8ua9swiR2",
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
		"payer": "tz1hyc1CRQpjskJUUaGrh85UZXPi6kU4JuGd",
		"source": "tz1hyc1CRQpjskJUUaGrh85UZXPi6kU4JuGd",
		"unparsing_mode": "Readable",
	}
	const response = await window.fetch(url, {
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

const reason = "Ubisoft Quartz NFTs are only available to Ubisoft players.\n" +
	"Please read [Ubisoft Quartz’s FAQ](https://quartz.ubisoft.com/faq/){:target=\"_blank\"} for more information."

type ERROR_CODE = "FROM_RESTRICTED" | "TO_RESTRICTED" | "TO_NOT_ALLOWED" | "BAD_TOKEN_ID" | "ARCHETYPE_QUOTA_REACHED"
| "ARCHOWNER_NOT_SET" | "ARCHLEDGER_NOT_SET" | "WHITELIST_ERROR"
type CheckResponse = {
	data: { string: "" | ERROR_CODE }
}
