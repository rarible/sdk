import type { EthereumWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { ConfigurationParameters } from "@rarible/ethereum-api-client"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { Maybe } from "@rarible/types/build/maybe"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { Mint } from "./mint"
import { SellInternal } from "./sell"
import { Fill } from "./fill"
import { Burn } from "./burn"
import { Transfer } from "./transfer"
import { Bid } from "./bid"
import { CancelOrder } from "./cancel"
import { Balance } from "./balance"
import { EthereumTokenId } from "./token-id"

export function createEthereumSdk(
	wallet: Maybe<EthereumWallet>,
	apis: IApisSdk,
	network: EthereumNetwork,
	params?: ConfigurationParameters
): IRaribleInternalSdk {
	const sdk = createRaribleSdk(wallet?.ethereum, network, params)
	const sellService = new SellInternal(sdk)
	const bidService = new Bid(sdk)

	return {
		nft: {
			transfer: new Transfer(sdk).transfer,
			mint: new Mint(sdk, apis).prepare,
			burn: new Burn(sdk).burn,
			generateTokenId: new EthereumTokenId(sdk).generateTokenId,
		},
		order: {
			fill: new Fill(sdk, wallet).fill,
			sell: sellService.sell,
			sellUpdate: sellService.update,
			bid: bidService.bid,
			bidUpdate: bidService.update,
			cancel: new CancelOrder(sdk).cancel,
		},
		balances: {
			getBalance: new Balance(sdk).getBalance,
		},
	}
}
