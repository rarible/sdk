import { AptosWallet } from "@rarible/sdk-wallet"
import { AptosGenericSdkWallet } from "@rarible/aptos-wallet"
import { createTestAptosState } from "@rarible/aptos-sdk/src/common/test"
import { createRaribleSdk } from "../../../../index"
import type { IRaribleSdk } from "../../../../index"
import { LogsLevel } from "../../../../domain"
import { getAPIKey } from "../../../../common/test/create-sdk"
import type { RaribleSdkEnvironment } from "../../../../config/domain"

export function createSdk(env: RaribleSdkEnvironment = "testnet"): IRaribleSdk {
  const { account, aptos } = createTestAptosState()
  return createRaribleSdk(new AptosWallet(new AptosGenericSdkWallet(aptos, account)), env, {
    logs: LogsLevel.DISABLED,
    apiKey: getAPIKey(env),
  })
}
