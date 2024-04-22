import {
	Network,
	TransactionResponseType,
} from "@aptos-labs/ts-sdk"
import type {
	TransactionResponse,
} from "@aptos-labs/ts-sdk"
import { Blockchain } from "@rarible/api-client"
import type { AptosSdkEnv } from "@rarible/aptos-sdk/build/domain"
import type { AptosSdk } from "@rarible/aptos-sdk"
import type { IBlockchainTransaction } from "../domain"

export class BlockchainAptosTransaction implements IBlockchainTransaction {
  blockchain: Blockchain = Blockchain.APTOS

  constructor(
  	readonly transaction: TransactionResponse,
  	readonly network: AptosSdkEnv,
  	readonly sdk: AptosSdk,
  ) {
  }

  hash = () => this.transaction.hash

  wait = async () => {
  	if (this.transaction.type === TransactionResponseType.Pending) {
  		await this.sdk.waitForTransaction(this.transaction.hash)
  	}

  	return {
  		blockchain: this.blockchain,
  		hash: this.transaction.hash,
  	}
  }

  getTxLink = () => {
  	switch (this.network) {
  		case Network.TESTNET:
  			return `https://explorer.aptoslabs.com/txn/${this.hash()}?network=testnet`
  		case Network.MAINNET:
  			return `https://explorer.aptoslabs.com/txn/${this.hash()}?network=mainnet`
  		default:
  			throw new Error("Unsupported transaction network")
  	}
  }

  get isEmpty(): boolean {
  	return false
  }
}
