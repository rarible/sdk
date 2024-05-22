import type { EthereumNetworkConfig } from "@rarible/protocol-ethereum-sdk/build/types"
import type { EVMBlockchain } from "@rarible/sdk-common"

export type IEthereumSdkConfig = {
  [B in EVMBlockchain]?: EthereumNetworkConfig
} & {
  /**
   * @deprecated
   */
  useDataV3?: boolean
  marketplaceMarker?: string
}
