import { EthereumWallet } from "@rarible/sdk-wallet/src"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { IRaribleSdk } from "../../domain"
import { Mint } from "./mint"
import { Fill } from "./fill"

export function createEthereumSdk(wallet: EthereumWallet): IRaribleSdk {
	const sdk = createRaribleSdk(wallet.ethereum, wallet.network)

	return {
		nft: {
			mint: new Mint(sdk).prepare,
		},
		order: {
			fill: new Fill(sdk).fill,
		},
	}
}
