import {
	Network, TransactionResponseType,
} from "@aptos-labs/ts-sdk"
import type {
	TransactionResponse,

	Aptos } from "@aptos-labs/ts-sdk"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { Blockchain } from "@rarible/api-client"
import type { AptosSdkEnv } from "@rarible/aptos-sdk/build/domain"

export class BlockchainAptosTransaction implements IBlockchainTransaction {
  blockchain: Blockchain = Blockchain.APTOS
  constructor(
  	readonly tx: TransactionResponse,
  	readonly network: AptosSdkEnv,
  	readonly sdk: Aptos,
  ) {
  }

  hash = () => this.tx.hash

  wait = async () => {
  	if (this.tx.type === TransactionResponseType.Pending) {
  		await this.sdk.waitForTransaction({ transactionHash: this.tx.hash })
  	}

  	return {
  		blockchain: this.blockchain,
  		hash: this.tx.hash,
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
}
