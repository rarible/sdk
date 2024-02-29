import type { Ethereum } from "@rarible/ethereum-provider"
import type { EthereumNetwork } from "../../types"
import type { EthereumConfig } from "../../config/type"
import { getEthereumConfig, getNetworkConfigByChainId } from "../../config"
import { getRequiredWallet } from "../get-required-wallet"

export class ConfigService {
	constructor(
		public readonly defaultNetwork: EthereumNetwork,
		public readonly ethereum: Ethereum | undefined
	) {}

    getRequiredWallet = () => getRequiredWallet(this.ethereum)

    getCurrentConfig = async (): Promise<EthereumConfig> => {
    	if (this.ethereum) {
    		const chainId = await this.ethereum.getChainId()
    		return getNetworkConfigByChainId(chainId)
    	}
    	return getEthereumConfig(this.defaultNetwork)
    }

    getCurrentNetwork = async () => {
    	const config = await this.getCurrentConfig()
    	return config.network
    }
}