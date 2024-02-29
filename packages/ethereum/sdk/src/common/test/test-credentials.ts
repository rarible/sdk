import { readEnv } from "@rarible/ethereum-sdk-test-common/build/common/env"
import type { EthereumNetwork } from "../../types"
import { getEthereumConfig } from "../../config"

// @todo all of them should be eliminted
// in favor of sponsor PK
export const DEV_PK_1 = "0x26250bb39160076f030517503da31e11aca80060d14f84ebdaced666efb89e21"
export const DEV_PK_2 = "0x4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7"
export const DEV_PK_3 = "0x064b2a70a2932eb5b45c760b210a2bee579d94031a8c40bff05cfd9d800d6812"

// This is PK of wallet that should be used as a sponsor for others
// during the test runs
export const SPONSOR_PK_1 = "0x26250bb39160076f030517503da31e11aca80060d14f84ebdaced666efb89e21"

export function getTestAPIKey(env: EthereumNetwork) {
	const network = getEthereumConfig(env)
	switch (network.environment) {
		case "production": return readEnv("SDK_API_KEY_PROD")
		default: return readEnv("SDK_API_KEY_TESTNET")
	}
}
