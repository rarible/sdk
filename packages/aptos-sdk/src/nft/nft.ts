import {
	AccountAddress,
} from "@aptos-labs/ts-sdk"
import type {
	Account,
	Aptos,
} from "@aptos-labs/ts-sdk"
import { AptosMethodClass } from "../common/method"
import { isChangeBelongsToType } from "../common"
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

export class AptosNft extends AptosMethodClass implements AptosNftSdk {
	constructor(readonly aptos: Aptos, readonly account: Account) {
		super(aptos, account)
	}

  createCollection = async (
  	options: CreateCollectionOptions
  ) => {
  	const createCollectionTransaction = await this.aptos.createCollectionTransaction({
  		name: options.name,
  		description: options.description,
  		uri: options.uri,
  		creator: this.account,
  	})
  	const tx = await this.sendAndWaitTx(createCollectionTransaction)

  	const collectionChange = tx.changes.find(state => {
  		return state.type === "write_resource" &&
        "data" in state && typeof state.data === "object" && state.data !== null &&
        "type" in state.data &&
        typeof state.data.type === "string" && state.data.type.includes("collection::Collection")
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
  	const mintTokenTransaction = await this.aptos.mintDigitalAssetTransaction({
  		description: options.description,
  		name: options.name,
  		uri: options.uri,
  		creator: this.account,
  		collection: options.collectionName,
  	})
  	const tx = await this.sendAndWaitTx(mintTokenTransaction)

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
  	const transferTransaction = await this.aptos.transferDigitalAssetTransaction({
  		sender: this.account,
  		digitalAssetAddress: tokenAddress,
  		recipient: AccountAddress.from(to),
  	})
  	return this.sendAndWaitTx(transferTransaction)
  }

  burn = async (tokenAddress: string) => {
  	const tx = await this.aptos.burnDigitalAssetTransaction({
  		creator: this.account,
  		digitalAssetAddress: tokenAddress,
  	})
  	return this.sendAndWaitTx(tx)
  }
}
