import {
	isString,
} from "@aptos-labs/ts-sdk"
import type {
	Aptos,
} from "@aptos-labs/ts-sdk"
import type { Maybe } from "@rarible/types"
import type { AptosWalletInterface } from "@rarible/aptos-wallet/src/domain"
import { getRequiredWallet, isChangeBelongsToType, MAX_U64_INT } from "../common"
import type { AptosNftSdk } from "../domain"

export type CreateCollectionOptions = { name: string, description: string, uri: string }
export type MintByCollectionNameOptions = {
	collectionName: string,
	name: string,
	description: string,
	uri: string
}

export type MintByCollectionAddressOptions = {
	collectionAddress: string,
	name: string,
	description: string,
	uri: string
}

export class AptosNft implements AptosNftSdk {
	constructor(readonly aptos: Aptos, readonly wallet: Maybe<AptosWalletInterface>) {
		this.createCollection = this.createCollection.bind(this)
		this.mintWithCollectionName = this.mintWithCollectionName.bind(this)
		this.mintWithCollectionAddress = this.mintWithCollectionAddress.bind(this)
		this.transfer = this.transfer.bind(this)
		this.burn = this.burn.bind(this)
	}

  createCollection = async (
  	options: CreateCollectionOptions
  ) => {

  	const transaction = {
  		arguments: [
  			options.description,
  			MAX_U64_INT,
  			options.name,
  			options.uri,
  			true,
  			true,
  			true,
  			true,
  			true,
  			true,
  			true,
  			true,
  			true,
  			"0",
  			"1",
  		],
  		function: "0x4::aptos_token::create_collection",
  		type: "entry_function_payload",
  		typeArguments: [],
  	}
  	const pendingTx = await getRequiredWallet(this.wallet)
  		.signAndSubmitTransaction(transaction)

  	const tx = await this.aptos.waitForTransaction({
  		transactionHash: pendingTx.hash,
  	})

  	const collectionChange = tx.changes.find(state => {
  		return state.type === "write_resource" &&
        "data" in state && typeof state.data === "object" && state.data !== null &&
        "type" in state.data &&
        isString(state.data.type) && state.data.type.includes("collection::Collection")
  	})
  	if (!(collectionChange && "address" in collectionChange)) {
  		throw new Error("Collection address has not been found")
  	}

  	return {
  		tx,
  		collectionAddress: collectionChange.address,
  	}
  }

  mintWithCollectionName = async (options: MintByCollectionNameOptions) => {
  	const transaction = {
  		function: "0x4::aptos_token::mint",
  		typeArguments: [],
  		arguments: [
  			options.collectionName,
  			options.description,
  			options.name,
  			options.uri,
  			[],
  			[],
  			[],
  		],
  		type: "entry_function_payload",
  	}
  	const pendingTx = await getRequiredWallet(this.wallet)
  		.signAndSubmitTransaction(transaction)

  	const tx = await this.aptos.waitForTransaction({
  		transactionHash: pendingTx.hash,
  	})

  	const mintChange = tx.changes.find(changeItem =>
  		isChangeBelongsToType(changeItem, (type) => type.includes("token::Token"))
  	)
  	if (!mintChange || !("address" in mintChange)) {
  		throw new Error("Collection address has not been found")
  	}

  	return {
  		tx,
  		tokenAddress: mintChange.address,
  	}
  }

  mintWithCollectionAddress = async (options: MintByCollectionAddressOptions) => {
  	const collection = await this.aptos.getCollectionDataByCollectionId({
  		collectionId: options.collectionAddress,
  	})
  	return this.mintWithCollectionName({
  		collectionName: collection.collection_name,
  		name: options.name,
  		description: options.description,
  		uri: options.uri,
  	})
  }

  transfer = async (
  	tokenAddress: string,
  	to: string
  ) => {
  	const transaction = {
  		function: "0x1::object::transfer",
  		typeArguments: ["0x4::token::Token"],
  		arguments: [tokenAddress, to],
  		type: "entry_function_payload",
  	}

  	const pendingTx = await getRequiredWallet(this.wallet)
  		.signAndSubmitTransaction(transaction)

  	return this.aptos.waitForTransaction({
  		transactionHash: pendingTx.hash,
  	})
  }

  burn = async (tokenAddress: string) => {
  	const transaction = {
  		function: "0x4::aptos_token::burn",
  		typeArguments: ["0x4::token::Token"],
  		arguments: [tokenAddress],
  		type: "entry_function_payload",
  	}
  	const pendingTx = await getRequiredWallet(this.wallet)
  		.signAndSubmitTransaction(transaction)

  	return this.aptos.waitForTransaction({
  		transactionHash: pendingTx.hash,
  	})
  }
}
