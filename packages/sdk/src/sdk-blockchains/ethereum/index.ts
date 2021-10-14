import { EthereumWallet } from "@rarible/sdk-wallet/src"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { IRaribleSdk } from "../../domain"
import { Mint } from "./mint"
import { Sell } from "./sell"
import { Fill } from "./fill"

export function createEthereumSdk(wallet: EthereumWallet): IRaribleSdk {
	const sdk = createRaribleSdk(wallet.ethereum, wallet.network)

	return {
		nft: {
			mint: new Mint(sdk).prepare,
		},
		order: {
			fill: new Fill(sdk, wallet).fill,
			sell: new Sell(sdk, wallet).sell,
		},
	}
}
