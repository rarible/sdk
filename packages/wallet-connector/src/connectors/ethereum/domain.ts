import type { ProviderConnectionResult, Blockchain } from "../../common/provider-wallet"

export interface EthereumProviderConnectionResult extends ProviderConnectionResult {
	blockchain: Blockchain.ETHEREUM
	provider: any
	chainId: number
	disconnect?: () => void
}
