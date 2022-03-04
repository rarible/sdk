import type { Cluster } from "@solana/web3.js"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet/src"
import { SolanaSdk } from "@rarible/solana-sdk"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"


export function createSolanaSdk(
	wallet: Maybe<SolanaWallet>,
	_apis: IApisSdk,
	cluster: Cluster,
): IRaribleInternalSdk {
	//const sdk = SolanaSdk.create({ connection: { cluster } })

	return {
		nft: {
			/*mint: mintService.mint,
			burn: new TezosBurn(maybeProvider, apis, network).burn,
			transfer: new TezosTransfer(maybeProvider, apis, network).transfer,*/
			/*generateTokenId: new TezosTokenId(maybeProvider, apis).generateTokenId,
			deploy: createCollectionService.createCollection,
			createCollection: createCollectionService.createCollection,
			preprocessMeta: Middlewarer.skipMiddleware(mintService.preprocessMeta),*/
		},
		order: {
			/*fill: fillService.fill,
			buy: fillService.fill,
			acceptBid: fillService.fill,
			sell: sellService.sell,
			sellUpdate: sellService.update,
			bid: bidService.bid,
			bidUpdate: bidService.update,
			cancel: new TezosCancel(maybeProvider, apis, network).cancel,*/
		},
		balances: {
			/*getBalance: balanceService.getBalance,*/
		},
		restriction: {
			/*canTransfer: new TezosCanTransfer(maybeProvider).canTransfer,*/
		},
	} as any
}
