import type { EthereumWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { ConfigurationParameters } from "@rarible/ethereum-api-client"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { Maybe } from "@rarible/types/build/maybe"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import type { CanTransferResult } from "../../types/nft/restriction/domain"
import type { LogsLevel } from "../../domain"
import { Middlewarer } from "../../common/middleware/middleware"
import { EthereumMint } from "./mint"
import { EthereumSell } from "./sell"
import { EthereumFill } from "./fill"
import { EthereumBurn } from "./burn"
import { EthereumTransfer } from "./transfer"
import { EthereumBid } from "./bid"
import { EthereumCancel } from "./cancel"
import { EthereumBalance } from "./balance"
import { EthereumTokenId } from "./token-id"
import { EthereumCreateCollection } from "./create-collection"

export function createEthereumSdk(
	wallet: Maybe<EthereumWallet>,
	apis: IApisSdk,
	network: EthereumNetwork,
	params?: ConfigurationParameters,
	logs?: LogsLevel
): IRaribleInternalSdk {
	console.log("sdk wal", wallet)
	const sdk = createRaribleSdk(wallet?.ethereum, network, { apiClientParams: params, logs: logs })
	const sellService = new EthereumSell(sdk, network)
	const balanceService = new EthereumBalance(sdk, network)
	const bidService = new EthereumBid(sdk, wallet, balanceService, network)
	const mintService = new EthereumMint(sdk, apis, network)
	const fillerService = new EthereumFill(sdk, wallet, network)
	const createCollectionService = new EthereumCreateCollection(sdk, network)

	return {
		nft: {
			transfer: new EthereumTransfer(sdk, network).transfer,
			mint: mintService.prepare,
			burn: new EthereumBurn(sdk, network).burn,
			generateTokenId: new EthereumTokenId(sdk).generateTokenId,
			deploy: createCollectionService.createCollection,
			createCollection: createCollectionService.createCollection,
			preprocessMeta: Middlewarer.skipMiddleware(mintService.preprocessMeta),
		},
		order: {
			fill: fillerService.fill,
			buy: fillerService.buy,
			acceptBid: fillerService.acceptBid,
			sell: sellService.sell,
			sellUpdate: sellService.update,
			bid: bidService.bid,
			bidUpdate: bidService.update,
			cancel: new EthereumCancel(sdk, network).cancel,
		},
		balances: {
			getBalance: balanceService.getBalance,
			convert: balanceService.convert,
		},
		restriction: {
			canTransfer(): Promise<CanTransferResult> {
				return Promise.resolve({ success: true })
			},
		},
	}
}
