import type { Aptos } from "@aptos-labs/ts-sdk"
import type { Maybe } from "@rarible/types"
import type { AptosWalletInterface } from "@rarible/aptos-wallet"
import { normalizeAptosAddress } from "@rarible/sdk-common"
import { isString } from "@aptos-labs/ts-sdk"
import { getRequiredWallet, isChangeBelongsToType, makeId, MAX_U64_INT } from "../common"
import type { AptosNftSdk } from "../domain"
import type { AddressConfig } from "../config"

export type CreateCollectionOptions = { name: string; description: string; uri: string }
export type MintByCollectionNameOptions = {
  collectionName: string
  name: string
  description: string
  uri: string
}

export type MintByCollectionAddressOptions = {
  collectionAddress: string
  name: string
  description: string
  uri: string
}

export class AptosNft implements AptosNftSdk {
  constructor(
    readonly aptos: Aptos,
    readonly wallet: Maybe<AptosWalletInterface>,
    readonly config: AddressConfig,
  ) {
    this.createCollection = this.createCollection.bind(this)
    this.mintWithCollectionName = this.mintWithCollectionName.bind(this)
    this.mintWithCollectionAddress = this.mintWithCollectionAddress.bind(this)
    this.transfer = this.transfer.bind(this)
    this.transferV1Token = this.transferV1Token.bind(this)
    this.burn = this.burn.bind(this)
  }
  createNativeCollection = async (options: CreateCollectionOptions) => {
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
    const pendingTx = await getRequiredWallet(this.wallet).signAndSubmitTransaction(transaction)

    const tx = await this.aptos.waitForTransaction({
      transactionHash: pendingTx.hash,
    })

    const collectionChange = tx.changes.find(state => {
      return (
        state.type === "write_resource" &&
        "data" in state &&
        typeof state.data === "object" &&
        state.data !== null &&
        "type" in state.data &&
        isString(state.data.type) &&
        state.data.type.includes("collection::Collection")
      )
    })
    if (!(collectionChange && "address" in collectionChange)) {
      throw new Error("Collection address has not been found")
    }

    return {
      tx,
      collectionAddress: collectionChange.address,
    }
  }
  createCollection = async (options: CreateCollectionOptions) => {
    const royaltiesAddress = (await getRequiredWallet(this.wallet).getAccountInfo()).address
    const royaltyPointsDenominator = "10000"
    const royaltyPointsNumerator = "0"
    const publicSaleMintTime = Math.floor(Date.now() / 1000)
    const publicSaleMintPrice = "0"
    const totalSupply = "10000"
    const collectionMutateSetting = [false, false, false]
    const tokenMutateSetting = [false, false, false, false, false]
    // used to generate unique collection address
    const collectionSeed = makeId(7)

    const maxPerWallet = 2
    const isOpenEdition = false
    const endTime = Math.floor(Date.now() / 1000) + 1000000
    const platformFee = 100
    const maxPerTransaction = 2
    const openeditionLimit = 0

    const transaction = {
      function: `${this.config.raribleDropMachineAddress}::rari_drop_machine::init_collection`,
      typeArguments: [],
      arguments: [
        options.name,
        options.description,
        options.uri,
        royaltiesAddress,
        royaltyPointsDenominator,
        royaltyPointsNumerator,
        publicSaleMintTime,
        publicSaleMintPrice,
        totalSupply,
        collectionMutateSetting,
        tokenMutateSetting,
        maxPerWallet,
        collectionSeed,
        isOpenEdition,
        endTime,
        platformFee,
        maxPerTransaction,
        openeditionLimit,
      ],
    }
    const pendingTx = await getRequiredWallet(this.wallet).signAndSubmitTransaction(transaction)

    const tx = await this.aptos.waitForTransaction({
      transactionHash: pendingTx.hash,
    })

    if (!("events" in tx)) {
      throw new Error("Create collection tx don't consist 'events' field")
    }

    const collectionEvent = tx.events.find(e => e?.type.includes("events::CollectionCreated"))
    if (!collectionEvent) {
      throw new Error("Collection create event has not been found")
    }
    if (!(collectionEvent && "data" in collectionEvent)) {
      throw new Error("Collection data has not been found")
    }

    return {
      tx,
      collectionAddress: normalizeAptosAddress(collectionEvent.data.rari_drop_address),
      rariDropAddress: normalizeAptosAddress(collectionEvent.data.rari_drop_address),
      aptosCollectionAddress: normalizeAptosAddress(collectionEvent.data.aptos_collection_address),
    }
  }

  mintWithCollectionName = async (options: MintByCollectionNameOptions) => {
    const transaction = {
      function: "0x4::aptos_token::mint",
      typeArguments: [],
      arguments: [options.collectionName, options.description, options.name, options.uri, [], [], []],
      type: "entry_function_payload",
    }
    const pendingTx = await getRequiredWallet(this.wallet).signAndSubmitTransaction(transaction)

    const tx = await this.aptos.waitForTransaction({
      transactionHash: pendingTx.hash,
    })

    const identifierEvent = tx.changes.find((e: any) => e?.data?.type === "0x4::token::TokenIdentifiers")
    let tokenName
    if (identifierEvent) {
      tokenName = (identifierEvent as any)?.data?.data?.name?.value
    }
    const mintChange = tx.changes.find(changeItem =>
      isChangeBelongsToType(changeItem, type => type.includes("token::Token")),
    )
    if (!mintChange || !("address" in mintChange)) {
      throw new Error("Collection address has not been found")
    }

    return {
      tx,
      tokenAddress: normalizeAptosAddress(mintChange.address),
      tokenName,
    }
  }

  mintWithCollectionAddress = async (options: MintByCollectionAddressOptions) => {
    const rawTx = {
      function: `${this.config.raribleDropMachineAddress}::rari_drop_machine::mint_script`,
      typeArguments: [],
      arguments: [options.collectionAddress],
    }
    const pendingTx = await getRequiredWallet(this.wallet).signAndSubmitTransaction(rawTx)
    const commitedTx = await this.aptos.waitForTransaction({
      transactionHash: pendingTx.hash,
    })
    if (!("events" in commitedTx)) {
      throw new Error("Mint transaction should consist 'events' field")
    }
    const mintEvent = commitedTx.events.find(e => e.type === "0x4::collection::Mint")
    if (!mintEvent) {
      throw new Error("Mint event has not been found")
    }
    const identifierEvent = commitedTx.changes.find((e: any) => e?.data?.type === "0x4::token::TokenIdentifiers")
    let tokenName

    if (identifierEvent) {
      tokenName = (identifierEvent as any)?.data?.data?.name?.value
    }
    return {
      tx: commitedTx,
      tokenAddress: normalizeAptosAddress(mintEvent.data.token),
      tokenName,
    }
  }

  transfer = async (tokenAddress: string, to: string) => {
    const transaction = {
      function: "0x1::object::transfer",
      typeArguments: ["0x4::token::Token"],
      arguments: [tokenAddress, to],
      type: "entry_function_payload",
    }

    const pendingTx = await getRequiredWallet(this.wallet).signAndSubmitTransaction(transaction)

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
    const pendingTx = await getRequiredWallet(this.wallet).signAndSubmitTransaction(transaction)

    return this.aptos.waitForTransaction({
      transactionHash: pendingTx.hash,
    })
  }

  burnV1Token = async (
    creatorAddress: string,
    collectionName: string,
    tokenName: string,
    propertyVersion: string,
    amount: string,
  ) => {
    const transaction = {
      function: "0x3::token::burn",
      typeArguments: [],
      arguments: [creatorAddress, collectionName, tokenName, propertyVersion, amount],
      type: "entry_function_payload",
    }
    const pendingTx = await getRequiredWallet(this.wallet).signAndSubmitTransaction(transaction)

    return this.aptos.waitForTransaction({
      transactionHash: pendingTx.hash,
    })
  }

  transferV1Token = async (
    receiver: string,
    creator: string,
    collection: string,
    name: string,
    propertyVersion: string,
    amount: string,
  ) => {
    const transaction = {
      function: "0x3::token::direct_transfer_script",
      typeArguments: [],
      arguments: [creator, collection, name, propertyVersion, amount],
      type: "entry_function_payload",
    }
    const pendingTx = await getRequiredWallet(this.wallet).signAndSubmitTransaction(transaction)

    return this.aptos.waitForTransaction({
      transactionHash: pendingTx.hash,
    })
  }
}
