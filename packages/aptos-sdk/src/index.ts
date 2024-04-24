import {
	Aptos,
	AptosConfig,
} from "@aptos-labs/ts-sdk"
import type { Maybe } from "@rarible/types"
import type { AptosWalletInterface } from "@rarible/aptos-wallet"
import { AptosNft } from "./nft/nft"
import type {
	AptosSdkEnv,
	AptosNftSdk,
	AptosBalanceSdk,
} from "./domain"
import type { AptosSdkConfig } from "./domain"
import { getNetworkFromEnv } from "./common"
import { AptosBalance } from "./balance/balance"
import type { WaitForTransactionType } from "./domain"

export class AptosSdk {
  public readonly nft: AptosNftSdk
  public readonly balance: AptosBalanceSdk
  public readonly waitForTransaction: WaitForTransactionType

  constructor(wallet: Maybe<AptosWalletInterface>, env: AptosSdkEnv, settings: AptosSdkConfig = {}) {
  	const networkFromEnv = getNetworkFromEnv(env)
  	const config = new AptosConfig({
  		...settings,
  		network: networkFromEnv,
  	})
  	const aptos = new Aptos(config)

  	this.nft = new AptosNft(aptos, wallet)
  	this.balance = new AptosBalance(aptos)
  	this.waitForTransaction = (hash: string) => aptos.waitForTransaction({ transactionHash: hash })
  }
}
