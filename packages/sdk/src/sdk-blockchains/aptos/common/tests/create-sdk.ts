import { AptosWallet } from "@rarible/sdk-wallet"
import { AptosGenericSdkWallet } from "@rarible/aptos-wallet"
import type { TestUtils } from "@rarible/aptos-sdk"
import { createRaribleSdk } from "../../../../index"
import type { IRaribleSdk } from "../../../../index"
import { LogsLevel } from "../../../../domain"
import { getAPIKey } from "../../../../common/test/create-sdk"
import type { RaribleSdkEnvironment } from "../../../../config/domain"

export function createSdk(state: TestUtils.TestAptosState, env: RaribleSdkEnvironment = "testnet"): IRaribleSdk {
  return createRaribleSdk(new AptosWallet(new AptosGenericSdkWallet(state.aptos, state.account)), env, {
    logs: LogsLevel.DISABLED,
    apiKey: getAPIKey(env),
  })
}
