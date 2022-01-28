import type { ProviderConnectionResult } from "../../common/provider-wallet"

export interface EthereumProviderConnectionResult extends ProviderConnectionResult {
	provider: any
	chainId: number
	disconnect?: () => void
}
