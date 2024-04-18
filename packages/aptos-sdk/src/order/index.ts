import { AptosMethodClass } from "../common/method"
import { isChangeBelongsToType } from "../common"

export class AptosOrder extends AptosMethodClass {
  sell = async (
  	tokenAddress: string,
  	feeObjectAddress: string,
  	startTime: number,
  	price: string
  ) => {
  	const marketplaceAddress = "0x"
  	// non-serialized arguments transaction
  	const pendingTransaction = await this.aptos.transaction.build.simple({
  		sender: this.account.accountAddress,
  		data: {
  			function: `${marketplaceAddress}::coin_listing::init_fixed_price`,
  			typeArguments: ["0x1::aptos_coin::AptosCoin"],
  			functionArguments: [
  				tokenAddress,
  				feeObjectAddress,
  				startTime,
  				price,
  			],
  		},
  	})

  	const tx = await this.sendAndWaitTx(pendingTransaction)
  	const change = tx.changes.find(change =>
  		isChangeBelongsToType(change, type => type.includes("token::Token"))
  	)
  	if (!change || !("address" in change)) {
  		throw new Error("Address has not been found")
  	}
  	return change.address
  }

  cancel = async (listing: string) => {
  	const marketplaceAddress = "0x"
  	const transaction = await this.aptos.transaction.build.simple({
  		sender: this.account.accountAddress,
  		data: {
  			function: `${marketplaceAddress}::coin_listing::end_fixed_price`,
  			typeArguments: ["0x1::aptos_coin::AptosCoin"],
  			functionArguments: [
  				listing,
  			],
  		},
  	})

  	return this.sendAndWaitTx(transaction)
  }

  collectionOffer = async (
  	collectionAddress: string,
  	amount: number,
  	feeObjectAddress: string,
  	endTime: number,
  	price: string
  ) => {
  	const marketplaceAddress = "0x"

  	const transaction = await this.aptos.transaction.build.simple({
  		sender: this.account.accountAddress,
  		data: {
  			function: `${marketplaceAddress}::collection_offer::init_for_tokenv2_entry`,
  			typeArguments: ["0x1::aptos_coin::AptosCoin"],
  			functionArguments: [
  				collectionAddress,
  				feeObjectAddress,
  				price,
  				amount,
  				endTime,
  			],
  		},
  	})

  	return this.sendAndWaitTx(transaction)
  }
}
