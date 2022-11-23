import type { Blockchain } from "@rarible/api-client"
import type { EthereumNetworkConfig } from "@rarible/protocol-ethereum-sdk/build/types"

export interface IEthereumSdkConfig {
	useDataV3?: boolean
	marketplaceMarker?: string
	[Blockchain.ETHEREUM]?: EthereumNetworkConfig
	[Blockchain.POLYGON]?: EthereumNetworkConfig
}
