import type { EthereumWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { ConfigurationParameters } from "@rarible/ethereum-api-client"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { Maybe } from "@rarible/types/build/maybe"
import { Blockchain } from "@rarible/api-client"
import { toBinary } from "@rarible/types"
import type { IApisSdk, IRaribleInternalSdk, LogsLevel } from "../../domain"
import type { CanTransferResult } from "../../types/nft/restriction/domain"
import { Middlewarer } from "../../common/middleware/middleware"
import { MetaUploader } from "../union/meta/upload-meta"
import { MethodWithPrepare } from "../../types/common"
import type { IMint } from "../../types/nft/mint"
import { notImplemented, nonImplementedAction } from "../../common/not-implemented"
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
import { EthereumCryptopunk } from "./cryptopunk"
import type { IEthereumSdkConfig } from "./domain"

export function createEthereumSdk(
	wallet: Maybe<EthereumWallet>,
	apis: IApisSdk,
	blockchain: Blockchain.ETHEREUM | Blockchain.POLYGON,
	network: EthereumNetwork,
	config: {
		params?: ConfigurationParameters,
		logs?: LogsLevel
	} & IEthereumSdkConfig
): IRaribleInternalSdk {
	const sdk = createRaribleSdk(wallet?.ethereum, network, {
		apiClientParams: config.params,
		logs: config.logs,
		ethereum: config[Blockchain.ETHEREUM],
		polygon: config[Blockchain.POLYGON],
		fillCalldata: config.fillCalldata ? toBinary(config.fillCalldata) : undefined,
	})

	const sellService = new EthereumSell(sdk, network, config)
	const balanceService = new EthereumBalance(sdk, apis, network)
	const bidService = new EthereumBid(sdk, wallet, balanceService, network, config)
	const mintService = new EthereumMint(sdk, apis, network)
	const fillService = new EthereumFill(sdk, wallet, network, config)
	const { createCollectionSimplified } = new EthereumCreateCollection(sdk, network)
	const cryptopunkService = new EthereumCryptopunk(sdk, network)
	const transferService = new EthereumTransfer(sdk, network)
	const burnService = new EthereumBurn(sdk, network)
	const cancelService = new EthereumCancel(sdk, network)
	const preprocessMeta = Middlewarer.skipMiddleware(mintService.preprocessMeta)
	const metaUploader = new MetaUploader(Blockchain.ETHEREUM, preprocessMeta)

	return {
		nft: {
			mint: new MethodWithPrepare(mintService.mintBasic, mintService.prepare) as IMint,
			burn: new MethodWithPrepare(burnService.burnBasic, burnService.burn),
			transfer: new MethodWithPrepare(transferService.transferBasic, transferService.transfer),
			generateTokenId: new EthereumTokenId(sdk).generateTokenId,
			createCollection: createCollectionSimplified,
			preprocessMeta,
			uploadMeta: metaUploader.uploadMeta,
		},
		order: {
			fill: { prepare: fillService.fill },
			buy: new MethodWithPrepare(fillService.buyBasic, fillService.fill),
			batchBuy: new MethodWithPrepare(notImplemented, nonImplementedAction),
			acceptBid: new MethodWithPrepare(fillService.acceptBidBasic, fillService.fill),
			sell: new MethodWithPrepare(sellService.sellBasic, sellService.sell),
			sellUpdate: new MethodWithPrepare(sellService.sellUpdateBasic, sellService.update),
			bid: new MethodWithPrepare(bidService.bidBasic, bidService.bid),
			bidUpdate: new MethodWithPrepare(bidService.bidUpdateBasic, bidService.update),
			cancel: cancelService.cancelBasic,
		},
		balances: {
			getBalance: balanceService.getBalance,
			convert: balanceService.convert,
			getBiddingBalance: balanceService.getBiddingBalance,
			depositBiddingBalance: balanceService.depositBiddingBalance,
			withdrawBiddingBalance: balanceService.withdrawBiddingBalance,
		},
		restriction: {
			canTransfer(): Promise<CanTransferResult> {
				return Promise.resolve({ success: true })
			},
		},
		ethereum: {
			wrapCryptoPunk: cryptopunkService.wrap,
			unwrapCryptoPunk: cryptopunkService.unwrap,
		},
	}
}
