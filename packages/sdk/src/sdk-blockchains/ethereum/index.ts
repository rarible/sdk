import { EthereumWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { CONFIGS } from "@rarible/protocol-ethereum-sdk/build/config"
import { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { Mint } from "./mint"
import { SellInternal } from "./sell"
import { Fill } from "./fill"
import { Burn } from "./burn"
import { Transfer } from "./transfer"
import { Bid } from "./bid"
import { CancelOrder } from "./cancel"
import { Balance } from "./balance"

export declare type Maybe<T> = T | undefined

export function createEthereumSdk(
	wallet: EthereumWallet, apis: IApisSdk, env: keyof typeof CONFIGS,
): IRaribleInternalSdk {
	const sdk = createRaribleSdk(wallet.ethereum, env)
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
