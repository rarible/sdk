import type { EthereumWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { ConfigurationParameters } from "@rarible/ethereum-api-client"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { Maybe } from "@rarible/types/build/maybe"
import { Blockchain } from "@rarible/api-client"
import { toBinary } from "@rarible/types"
import { getApis } from "@rarible/protocol-ethereum-sdk/src/common/apis"
import type { IRaribleEthereumSdkConfig } from "@rarible/protocol-ethereum-sdk/src/types"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { LogsLevel } from "../../domain"
import type { CanTransferResult } from "../../types/nft/restriction/domain"
import { Middlewarer } from "../../common/middleware/middleware"
import { MetaUploader } from "../union/meta/upload-meta"
import { getErrorHandlerMiddleware, NetworkErrorCode } from "../../common/apis"
import { MethodWithPrepare } from "../../types/common"
import type { IMint } from "../../types/nft/mint"
import type { GetFutureOrderFeeData } from "../../types/nft/restriction/domain"
import { notImplemented } from "../../common/not-implemented"
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
import type { EVMBlockchain } from "./common"

export function createEthereumSdk(
	wallet: Maybe<EthereumWallet>,
	apis: IApisSdk,
	blockchain: EVMBlockchain,
	network: EthereumNetwork,
	config: {
		params?: ConfigurationParameters,
		logs?: { level: LogsLevel, session: string },
		apiKey?: string
	} & IEthereumSdkConfig
): IRaribleInternalSdk {
	const sdkConfig: IRaribleEthereumSdkConfig = {
		apiClientParams: {
			...(config?.params || {}),
			middleware: [
				...(config.logs?.level !== LogsLevel.DISABLED
					? [getErrorHandlerMiddleware(NetworkErrorCode.ETHEREUM_NETWORK_ERR)]
					: []),
				...(config?.params?.middleware || []),
			],
		},
		logs: config.logs,
		ethereum: config[Blockchain.ETHEREUM],
		polygon: config[Blockchain.POLYGON],
		marketplaceMarker: config.marketplaceMarker ? toBinary(config.marketplaceMarker) : undefined,
		apiKey: config.apiKey,
	}
	const sdk = createRaribleSdk(wallet?.ethereum, network, sdkConfig)

	const getEthereumApis = async () => {
		return getApis(wallet?.ethereum, network, sdkConfig)
	}

	const sellService = new EthereumSell(sdk, wallet, network, getEthereumApis, config)
	const balanceService = new EthereumBalance(sdk, wallet, apis, network)
	const bidService = new EthereumBid(sdk, wallet, apis, balanceService, network, getEthereumApis, config)
	const mintService = new EthereumMint(sdk, wallet, apis, network)
	const fillService = new EthereumFill(sdk, wallet, network, config)
	const { createCollectionSimplified } = new EthereumCreateCollection(sdk, wallet, network)
	const cryptopunkService = new EthereumCryptopunk(sdk, wallet, network)
	const transferService = new EthereumTransfer(sdk, wallet, network)
	const burnService = new EthereumBurn(sdk, wallet, network, getEthereumApis)
	const cancelService = new EthereumCancel(sdk, wallet, network)
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
			buy: new MethodWithPrepare(fillService.buyBasic, fillService.buy),
			batchBuy: new MethodWithPrepare(fillService.batchBuyBasic, fillService.batchBuy),
			acceptBid: new MethodWithPrepare(fillService.acceptBidBasic, fillService.acceptBid),
			sell: new MethodWithPrepare(sellService.sellBasic, sellService.sell),
			sellUpdate: new MethodWithPrepare(sellService.sellUpdateBasic, sellService.update),
			bid: new MethodWithPrepare(bidService.bidBasic, bidService.bid),
			bidUpdate: new MethodWithPrepare(bidService.bidUpdateBasic, bidService.update),
			cancel: cancelService.cancel,
		},
		balances: {
			getBalance: balanceService.getBalance,
			convert: balanceService.convert,
			transfer: notImplemented,
			getBiddingBalance: balanceService.getBiddingBalance,
			depositBiddingBalance: balanceService.depositBiddingBalance,
			withdrawBiddingBalance: balanceService.withdrawBiddingBalance,
		},
		restriction: {
			canTransfer(): Promise<CanTransferResult> {
				return Promise.resolve({ success: true })
			},
			getFutureOrderFees(): Promise<GetFutureOrderFeeData> {
				return sellService.getFutureOrderFees()
			},
		},
		ethereum: {
			wrapCryptoPunk: cryptopunkService.wrap,
			unwrapCryptoPunk: cryptopunkService.unwrap,
			getBatchBuyAmmInfo: fillService.getBuyAmmInfo,
		},
	}
}
