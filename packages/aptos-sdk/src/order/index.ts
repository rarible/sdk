import { AptosMethodClass } from "../common/method"
import { TESTNET_NFT_MARKETPLACE } from "../config"
import { isChangeBelongsToType } from "../common"

export class AptosOrder extends AptosMethodClass {
  sell = async (
  	tokenAddress: string,
  	feeObjectAddress: string,
  	startTime: number,
  	price: string
  ) => {
  	const marketplaceAddress = TESTNET_NFT_MARKETPLACE
  	// const nft_token = "0x2403e8b3fd91e6ebf95f1a3c2f98fc87261c35e0af66b0697b9506fac9a31a56"
  	// const fee_schedule = process.env.FEE_SCHEDULER
  	// const startTime = Math.floor(Date.now()/1000)
  	// const price = "2000000"

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
  	// const mintChange = tx.changes.find(change =>
  		// isChangeBelongsToType(change, "0x4::token::Token")
  	// )
  }

  cancel = async (listing: string) => {
  	const marketplaceAddress = TESTNET_NFT_MARKETPLACE
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
  	const marketplaceAddress = TESTNET_NFT_MARKETPLACE
  	// const item_price = "1500000"
  	// const amount = 5
  	// const expiration_time = Math.floor(Date.now()/1000) + 24 * 60 * 60 * 60

  	// non-serialized arguments transaction
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
