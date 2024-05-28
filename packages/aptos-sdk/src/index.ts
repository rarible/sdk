import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk"
import type { Maybe } from "@rarible/types"
import type { AptosWalletInterface } from "@rarible/aptos-wallet"
import { AptosNft } from "./nft/nft"
import type { SupportedNetwork, AptosNftSdk, AptosBalanceSdk } from "./domain"
import type { AptosSdkConfig } from "./domain"
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

  constructor(wallet: Maybe<AptosWalletInterface>, env: SupportedNetwork, settings: AptosSdkConfig = {}) {
    const config = new AptosConfig({
      ...(settings.overrides || {}),
      network: env,
    })
    const aptos = new Aptos(config)
    const addressConfig = getEnvConfig(env)

    this.nft = new AptosNft(aptos, wallet, addressConfig)
    this.balance = new AptosBalance(aptos)
    this.order = new AptosOrder(aptos, wallet, addressConfig)
    this.waitForTransaction = (hash: string) => aptos.waitForTransaction({ transactionHash: hash })
  }
}

export * from "./domain"
export * from "./common"
