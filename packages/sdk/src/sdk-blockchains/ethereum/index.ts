import type { EthereumWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { ConfigurationParameters } from "@rarible/ethereum-api-client"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { Mint } from "./mint"
import { SellInternal } from "./sell"
import { Fill } from "./fill"
import { Burn } from "./burn"
import { Transfer } from "./transfer"
import { Bid } from "./bid"
import { CancelOrder } from "./cancel"
import { Balance } from "./balance"
import type { EthereumNetwork } from "./domain"

export function createEthereumSdk<T extends Ethereum>(
	wallet: EthereumWallet<T>,
	apis: IApisSdk,
	network: EthereumNetwork,
	params?: ConfigurationParameters
): IRaribleInternalSdk {
	const sdk = createRaribleSdk(wallet.ethereum, network, params)
	const sellService = new SellInternal(sdk)
	const bidService = new Bid(sdk)

	return {
		nft: {
			transfer: new Transfer(sdk).transfer,
			mint: new Mint(sdk, apis).prepare,
			burn: new Burn(sdk).burn,
		},
		order: {
			fill: new Fill(sdk, wallet).fill,
			sell: sellService.sell,
			sellUpdate: sellService.update,
			bid: bidService.bid,
			bidUpdate: bidService.update,
			cancel: new CancelOrder(sdk, wallet).cancel,
		},
		balances: {
			getBalance: new Balance(sdk).getBalance,
		},
	}
}
