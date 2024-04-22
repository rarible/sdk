import type {
	Account,
	CommittedTransactionResponse,
} from "@aptos-labs/ts-sdk"
import {
	Aptos,
	AptosConfig,
} from "@aptos-labs/ts-sdk"
import type { Maybe } from "@rarible/types"
import type { AptosWallet } from "@rarible/aptos-wallet"
import { AptosNft } from "./nft/nft"
import type {
	AptosSdkEnv,
	AptosNftSdk,
} from "./domain"
import type { AptosSdkConfig } from "./domain"
import { getNetworkFromEnv } from "./common"

export class AptosSdk {
  public readonly nft: AptosNftSdk
  public readonly waitForTransaction: (hash: string) => Promise<CommittedTransactionResponse>

  constructor(wallet: Maybe<AptosWallet>, env: AptosSdkEnv, settings: AptosSdkConfig = {}) {
  	const networkFromEnv = getNetworkFromEnv(env)
  	const config = new AptosConfig({
  		...settings,
  		network: networkFromEnv,
  	})
  	const aptos = new Aptos(config)

  	this.nft = new AptosNft(aptos, wallet)
  	this.waitForTransaction = (hash: string) => aptos.waitForTransaction({ transactionHash: hash })
  }
}
