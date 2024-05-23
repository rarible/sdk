import type { Aptos } from "@aptos-labs/ts-sdk"
import type { CommittedTransactionResponse } from "@aptos-labs/ts-sdk"
import type { Maybe } from "@rarible/types"
import type { AptosWalletInterface } from "@rarible/aptos-wallet"
import type { AptosTransaction } from "@rarible/aptos-wallet"
import { APT_TOKEN_TYPE, getListingTokenType, getRequiredWallet, isChangeBelongsToType } from "../common"
import type { AddressConfig } from "../config"

export class AptosOrder {
	constructor(
		readonly aptos: Aptos,
		readonly wallet: Maybe<AptosWalletInterface>,
		readonly config: AddressConfig
	) {
		this.createFeeSchedule = this.createFeeSchedule.bind(this)
		this.getFeeScheduleAddress = this.getFeeScheduleAddress.bind(this)
		this.sendAndWaitTx = this.sendAndWaitTx.bind(this)
		this.getListingTokenType = this.getListingTokenType.bind(this)
		this.sell = this.sell.bind(this)
		this.buy = this.buy.bind(this)
		this.cancel = this.cancel.bind(this)
		this.collectionOffer = this.collectionOffer.bind(this)
		this.cancelCollectionOffer = this.cancelCollectionOffer.bind(this)
		this.acceptCollectionOffer = this.acceptCollectionOffer.bind(this)
		this.tokenOffer = this.tokenOffer.bind(this)
		this.cancelTokenOffer = this.cancelTokenOffer.bind(this)
		this.acceptTokenOffer = this.acceptTokenOffer.bind(this)
	}

	private async sendAndWaitTx(tx: AptosTransaction): Promise<CommittedTransactionResponse> {
		const pendingTx = await getRequiredWallet(this.wallet)
			.signAndSubmitTransaction(tx)
		return this.aptos.waitForTransaction({
			transactionHash: pendingTx.hash,
		})
	}

  sell = async (
  	tokenAddress: string,
  	feeObjectAddress: string,
  	startTime: number,
  	price: string
  ) => {
  	const rawTx = {
  		function: `${this.config.marketplaceAddress}::coin_listing::init_fixed_price`,
  		typeArguments: [APT_TOKEN_TYPE],
  		arguments: [
  			tokenAddress,
  			feeObjectAddress,
  			startTime,
  			price,
  		],
  	}
  	const tx = await this.sendAndWaitTx(rawTx)
  	const change = tx.changes.find(change =>
  		isChangeBelongsToType(change, type => type.includes("listing::Listing"))
  	)
  	if (!change || !("address" in change)) {
  		throw new Error("Address has not been found")
  	}
  	return change.address
  }

  getListingTokenType = async (listing: string) => {
  	const listingObject = await this.aptos.getAccountResources({
  		accountAddress: listing,
  	})
  	return getListingTokenType(listingObject)
  }

  sellUpdate = async (
  	listing: string,
  	price: string
  ) => {
  	const listingObject = await this.aptos.getAccountResources({
  		accountAddress: listing,
  	})
  	const listingResource: any = listingObject.find(o => o.type.includes("listing::Listing"))

  	if (!listingResource?.data?.fee_schedule?.inner) {
  		throw new Error("Fee object has no been found")
  	}
  	const tokenType = getListingTokenType(listingObject)

  	const rawTx = {
  		function: `${this.config.marketplaceAddress}::coin_listing::init_fixed_price`,
  		typeArguments: [tokenType],
  		arguments: [
  			listingResource?.data?.object?.inner,
  			listingResource?.data?.fee_schedule?.inner,
  			listingResource.start_time,
  			price,
  		],
  	}

  	const tx = await this.sendAndWaitTx(rawTx)
  	const change = tx.changes.find(change =>
  		isChangeBelongsToType(change, type => type.includes("listing::Listing"))
  	)
  	if (!change || !("address" in change)) {
  		throw new Error("Address has not been found")
  	}
  	return change.address
  }

  buy = async (
  	listing: string,
  ) => {
  	const tokenType = await this.getListingTokenType(listing)
  	const rawTx = {
  		function: `${this.config.marketplaceAddress}::coin_listing::purchase`,
  		typeArguments: [tokenType],
  		arguments: [
  			listing,
  		],
  	}
  	return this.sendAndWaitTx(rawTx)
  }

  cancel = async (
  	listing: string,
  ) => {
  	const tokenType = await this.getListingTokenType(listing)
  	const rawTx = {
  		function: `${this.config.marketplaceAddress}::coin_listing::end_fixed_price`,
  		typeArguments: [tokenType],
  		arguments: [
  			listing,
  		],
  	}
  	return this.sendAndWaitTx(rawTx)
  }

  collectionOffer = async (
  	collectionAddress: string,
  	amount: number,
  	feeObjectAddress: string,
  	endTime: number,
  	price: string
  ) => {
  	const rawTx = {
  		function: `${this.config.marketplaceAddress}::collection_offer::init_for_tokenv2_entry`,
  		typeArguments: [APT_TOKEN_TYPE],
  		arguments: [
  			collectionAddress,
  			feeObjectAddress,
  			price,
  			amount,
  			endTime,
  		],
  	}

  	const tx = await this.sendAndWaitTx(rawTx)
  	const change = tx.changes.find(change =>
  	  isChangeBelongsToType(change, type => type.includes("collection_offer::CollectionOffer"))
  	)
  	if (!change || !("address" in change)) {
  	  throw new Error("Address has not been found")
  	}
  	return change.address
  }

  cancelCollectionOffer = async (
  	offer: string,
  ) => {
  	const rawTx = {
  		function: `${this.config.marketplaceAddress}::collection_offer::cancel`,
  		typeArguments: [APT_TOKEN_TYPE],
  		arguments: [
  			offer,
  		],
  	}

  	return this.sendAndWaitTx(rawTx)
  }

  async acceptCollectionOffer(
  	offer: string,
  	token: string
  ) {
  	const rawTx = {
  		function: `${this.config.marketplaceAddress}::collection_offer::sell_tokenv2`,
  		typeArguments: [APT_TOKEN_TYPE],
  		arguments: [
  			offer,
  			token,
  		],
  	}

  	return this.sendAndWaitTx(rawTx)
  }

  tokenOffer = async (
  	tokenAddress: string,
  	feeObjectAddress: string,
  	endTime: number,
  	price: string
  ) => {
  	const rawTx = {
  		function: `${this.config.marketplaceAddress}::token_offer::init_for_tokenv2_entry`,
  		typeArguments: [APT_TOKEN_TYPE],
  		arguments: [
  			tokenAddress,
  			feeObjectAddress,
  			price,
  			endTime,
  		],
  	}

  	const tx = await this.sendAndWaitTx(rawTx)
  	if (!("events" in tx)) {
  		throw new Error("Events field in tx object was expected")
  	}
  	const event = tx.events.find(e =>
  		e.type.includes("events::TokenOfferPlaced")
  	)
  	if (!event || !("token_offer" in event.data)) {
  		throw new Error("Offer has not been found")
  	}
  	// @ts-ignore
  	return event.data.token_offer
  }

  cancelTokenOffer = async (offer: string) => {
  	const rawTx = {
  		function: `${this.config.marketplaceAddress}::token_offer::cancel`,
  		typeArguments: [APT_TOKEN_TYPE],
  		arguments: [
  			offer,
  		],
  	}

  	return this.sendAndWaitTx(rawTx)
  }

  async acceptTokenOffer(
  	offer: string,
  ) {
  	const rawTx = {
  		function: `${this.config.marketplaceAddress}::token_offer::sell_tokenv2`,
  		typeArguments: [APT_TOKEN_TYPE],
  		arguments: [
  			offer,
  		],
  	}

  	return this.sendAndWaitTx(rawTx)
  }

  async createFeeSchedule({ value, receiveAddress }: { value: number, receiveAddress?: string}): Promise<string> {
  	const commissionDenominator = "10000"
  	const commissionNumerator = value.toString()
  	const biddingFee = "0"
  	const listingFee = "0"
  	const addr = receiveAddress ?? (await getRequiredWallet(this.wallet).getAccountInfo()).address
  	const rawTx = {
  		function: `${this.config.marketplaceAddress}::fee_schedule::init_entry`,
  		typeArguments: [],
  		arguments: [
  			addr,
  			biddingFee,
  			listingFee,
  			commissionDenominator,
  			commissionNumerator,
  		],
  	}
  	const tx = await this.sendAndWaitTx(rawTx)
  	const change = tx.changes.find(change =>
  		isChangeBelongsToType(change, type => type.includes("fee_schedule::FeeSchedule"))
  	)
  	if (!change || !("address" in change)) {
  		throw new Error("Address has not been found")
  	}
  	return change.address
  }

  getFeeScheduleAddress() {
  	return this.config.feeZeroScheduleAddress
  }
}
