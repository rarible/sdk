import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "@rarible/ethereum-provider"
import { Warning } from "@rarible/logger/build"
import type { EthereumConfig } from "../config/type"
import { getRequiredWallet } from "../common/get-required-wallet"

/**
 * Check the wallet chainId is the same as in the config
 * @param ethereum Wallet
 * @param config EthereumConfig
 */

export async function checkChainId(
	ethereum: Maybe<Ethereum>,
	config: EthereumConfig
): Promise<boolean> {
	const provider = getRequiredWallet(ethereum)
	const activeChainId = await provider.getChainId()
	if (config.chainId !== activeChainId) throw new WrongNetworkWarning(activeChainId, config.chainId)
	return true
}

export class WrongNetworkWarning extends Warning {
	constructor(active: number, required: number) {
		super(`Change network of your wallet. Required chainId ${required}, but active is ${active}`)
		this.name = "WrongNetworkWarning"
		Object.setPrototypeOf(this, WrongNetworkWarning.prototype)
	}
}