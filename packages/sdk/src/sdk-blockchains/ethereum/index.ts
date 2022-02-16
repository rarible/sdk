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
import { EthereumDeploy } from "./deploy"
import { EthereumAuctionStart } from "./auction/start"
import { EthereumAuctionPutBid } from "./auction/put-bid"
import { EthereumAuctionBuyOut } from "./auction/buy-out"
import { EthereumAuctionFinish } from "./auction/finish"
import { EthereumAuctionCancel } from "./auction/cancel"

export function createEthereumSdk(
	wallet: Maybe<EthereumWallet>,
	apis: IApisSdk,
	network: EthereumNetwork,
	params?: ConfigurationParameters,
	logs?: LogsLevel
): IRaribleInternalSdk {
	const sdk = createRaribleSdk(wallet?.ethereum, network, { apiClientParams: params, logs: logs })
	const sellService = new EthereumSell(sdk, network)
	const balanceService = new EthereumBalance(sdk)
	const bidService = new EthereumBid(sdk, wallet, balanceService, network)
	const mintService = new EthereumMint(sdk, apis, network)
	const fillerService = new EthereumFill(sdk, wallet, network)
	return {
		nft: {
			transfer: new EthereumTransfer(sdk, network).transfer,
			mint: mintService.prepare,
			burn: new EthereumBurn(sdk, network).burn,
			generateTokenId: new EthereumTokenId(sdk).generateTokenId,
			deploy: new EthereumDeploy(sdk, network).deployToken,
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
		auction: {
			start: new EthereumAuctionStart(sdk, wallet, network).start,
			cancel: new EthereumAuctionCancel(sdk, wallet, network).cancel,
			finish: new EthereumAuctionFinish(sdk, wallet, network).finish,
			putBid: new EthereumAuctionPutBid(sdk, wallet, network).putBid,
			buyOut: new EthereumAuctionBuyOut(sdk, wallet, network).buyOut,
		},
		balances: {
			getBalance: balanceService.getBalance,
		},
		restriction: {
			canTransfer(): Promise<CanTransferResult> {
				return Promise.resolve({ success: true })
			},
		},
	}
}
