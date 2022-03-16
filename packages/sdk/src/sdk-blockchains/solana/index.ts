import type { Cluster } from "@solana/web3.js"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet/src"
import { SolanaSdk } from "@rarible/solana-sdk"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { nonImplementedAction } from "../../common/not-implemented"
import { SolanaMint } from "./mint"
import { SolanaFill } from "./fill"
import { SolanaSell } from "./sell"
import { SolanaBalance } from "./balance"


export function createSolanaSdk(
	wallet: Maybe<SolanaWallet>,
	apis: IApisSdk,
	cluster: Cluster,
): IRaribleInternalSdk {
	const sdk = SolanaSdk.create({ connection: { cluster } })
	//const mintService = new SolanaMint(sdk, wallet)
	const balanceService = new SolanaBalance(sdk, wallet)
	const sellService = new SolanaSell(sdk, wallet)
	const fillService = new SolanaFill(sdk, wallet, apis)

	return {
		nft: {
			mint: nonImplementedAction, //mintService.mint,
			burn: nonImplementedAction, //new TezosBurn(maybeProvider, apis, network).burn,
			transfer: nonImplementedAction, //new TezosTransfer(maybeProvider, apis, network).transfer,*/
			generateTokenId: nonImplementedAction, //new TezosTokenId(maybeProvider, apis).generateTokenId,
			deploy: nonImplementedAction, //createCollectionService.createCollection,
			createCollection: nonImplementedAction, // createCollectionService.createCollection,
			preprocessMeta: nonImplementedAction, // Middlewarer.skipMiddleware(mintService.preprocessMeta),
		},
		order: {
			fill: fillService.fill, //fillService.fill,
			buy: fillService.fill, //fillService.fill,
			acceptBid: fillService.fill, // fillService.fill,
			sell: sellService.sell, // sellService.sell,
			sellUpdate: nonImplementedAction, // sellService.update,
			bid: nonImplementedAction, // bidService.bid,
			bidUpdate: nonImplementedAction, // bidService.update,
			cancel: nonImplementedAction, // new TezosCancel(maybeProvider, apis, network).cancel,
		},
		balances: {
			getBalance: balanceService.getBalance, // balanceService.getBalance,
		},
		restriction: {
			canTransfer: nonImplementedAction, //new TezosCanTransfer(maybeProvider).canTransfer,
		},
	} as any
}
