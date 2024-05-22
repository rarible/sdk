import { readEnv } from "@rarible/ethereum-sdk-test-common/build/common/env"
import type { EthereumNetwork } from "../../types"
import { getEthereumConfig } from "../../config"

export function getTestAPIKey(env: EthereumNetwork) {
  const network = getEthereumConfig(env)
  switch (network.environment) {
    case "production":
      return readEnv("SDK_API_KEY_PROD")
    default:
      return readEnv("SDK_API_KEY_TESTNET")
  }
}

export { getE2EConfigByNetwork, getTestContract, DEV_PK_1, DEV_PK_2, DEV_PK_3 } from "@rarible/ethereum-sdk-test-common"
