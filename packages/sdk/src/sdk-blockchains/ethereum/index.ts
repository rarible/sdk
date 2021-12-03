import type { EthereumWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { ConfigurationParameters } from "@rarible/ethereum-api-client"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { Maybe } from "@rarible/types/build/maybe"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import type { CanTransferResult } from "../../types/nft/restriction/domain"
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

export function createEthereumSdk(
	wallet: Maybe<EthereumWallet>,
	apis: IApisSdk,
	network: EthereumNetwork,
	params?: ConfigurationParameters,
): IRaribleInternalSdk {
	const sdk = createRaribleSdk(wallet?.ethereum, network, params)
	const sellService = new EthereumSell(sdk)
	const bidService = new EthereumBid(sdk)
	const mintService = new EthereumMint(sdk, apis)

	return {
		nft: {
			transfer: new EthereumTransfer(sdk).transfer,
			mint: mintService.prepare,
			burn: new EthereumBurn(sdk).burn,
			generateTokenId: new EthereumTokenId(sdk).generateTokenId,
			deploy: new EthereumDeploy(sdk).deployToken,
			preprocessMeta: mintService.preprocessMeta,
		},
		order: {
			fill: new EthereumFill(sdk, wallet).fill,
			sell: sellService.sell,
			sellUpdate: sellService.update,
			bid: bidService.bid,
			bidUpdate: bidService.update,
			cancel: new EthereumCancel(sdk).cancel,
		},
		balances: {
			getBalance: new EthereumBalance(sdk).getBalance,
		},
		restriction: {
			canTransfer(): Promise<CanTransferResult> {
				return Promise.resolve({ success: true })
			},
		},
	}
}
