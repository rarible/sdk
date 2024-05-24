import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk"
import type { Maybe } from "@rarible/types"
import type { AptosWalletInterface } from "@rarible/aptos-wallet"
import { AptosNft } from "./nft/nft"
import type { AptosSdkEnv, AptosNftSdk, AptosBalanceSdk } from "./domain"
import type { AptosSdkConfig } from "./domain"
import { getNetworkFromEnv } from "./common"
import { AptosBalance } from "./balance/balance"
import type { WaitForTransactionType } from "./domain"
import { getEnvConfig } from "./config"
import type { AptosOrderSdk } from "./domain"
import { AptosOrder } from "./order"

export class AptosSdk {
  public readonly nft: AptosNftSdk
  public readonly order: AptosOrderSdk
  public readonly balance: AptosBalanceSdk
  public readonly waitForTransaction: WaitForTransactionType

  constructor(wallet: Maybe<AptosWalletInterface>, env: AptosSdkEnv, settings: AptosSdkConfig = {}) {
    const networkFromEnv = getNetworkFromEnv(env)
    const config = new AptosConfig({
      ...settings,
      network: networkFromEnv,
    })
    const aptos = new Aptos(config)
    const addressConfig = getEnvConfig(networkFromEnv)

    this.nft = new AptosNft(aptos, wallet, addressConfig)
    this.balance = new AptosBalance(aptos)
    this.order = new AptosOrder(aptos, wallet, addressConfig)
    this.waitForTransaction = (hash: string) => aptos.waitForTransaction({ transactionHash: hash })
  }
}

export * from "./domain"
export { APT_DIVIDER } from "./common"
