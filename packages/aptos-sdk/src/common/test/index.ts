import type { AnyRawTransaction, CommittedTransactionResponse, Ed25519Account } from "@aptos-labs/ts-sdk"
import { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey } from "@aptos-labs/ts-sdk"
import { AptosGenericSdkWallet } from "@rarible/aptos-wallet"
import { isObjectLike } from "@rarible/sdk-common"
import { AptosNft } from "../../nft/nft"
import type { AddressConfig } from "../../config"
import { getEnvConfig } from "../../config"

export function createTestAptosState(privateKey: string = DEFAULT_PK): TestAptosState {
  const pk = new Ed25519PrivateKey(privateKey)
  const account = Account.fromPrivateKey({ privateKey: pk })

  const APTOS_NETWORK: Network = Network.TESTNET
  const config = new AptosConfig({ network: APTOS_NETWORK })
  const envConfig = getEnvConfig(APTOS_NETWORK)
  const aptos = new Aptos(config)
  const wallet = new AptosGenericSdkWallet(aptos, account)

  return {
    aptos,
    account,
    wallet,
    config: envConfig,
    transferAPT: transferAptosCoins.bind(null, { aptos, wallet }),
  }
}

export function generateTestAptosState(): TestAptosState {
  const account = Account.generate()
  console.log("pk", account.privateKey.toString())
  console.log("address", account.accountAddress.toString())

  const APTOS_NETWORK: Network = Network.TESTNET
  const config = new AptosConfig({ network: APTOS_NETWORK })
  const envConfig = getEnvConfig(APTOS_NETWORK)
  const aptos = new Aptos(config)

  const wallet = new AptosGenericSdkWallet(aptos, account)
  return {
    aptos,
    account,
    wallet,
    config: envConfig,
    transferAPT: transferAptosCoins.bind(null, { aptos, wallet }),
  }
}

export type TestAptosState = {
  aptos: Aptos
  account: Ed25519Account
  wallet: AptosGenericSdkWallet
  config: AddressConfig
  transferAPT: (recepient: string, amount: string) => Promise<CommittedTransactionResponse>
}

//0x484e284d3b98ce736b6b6de27127176bafe30942d949f30b0ab59a17007ccf37
export const DEFAULT_PK = "0x229eea52e53be5a6fd1ba00e660fc632cdb47ffe8f777a847daa8220553c5511"
//0xa4576f0bc3f835b5b45b4e49da280779b6352f2083fe28c94386468731b3fd3c
export const BUYER_PK = "0x15b7dde0584838dd033894bfaa9f64013206ff3f82d9d325e1479cab4709e43c"

export async function mintTestToken(
  state: TestAptosState,
  options?: { collectionName: string } | { collectionAddress: string },
) {
  const mintClass = new AptosNft(state.aptos, new AptosGenericSdkWallet(state.aptos, state.account), state.config)
  const randomId = Math.floor(Math.random() * 1000000)
  const uri = "ipfs://QmWYpMyoaUGNRSQbwhw97xM8tcRWm4Et598qtzmzsau7ch/"
  const tokenName = `Mytoken #${randomId}`
  let mintResult, tokenAddress
  if (!options || (isObjectLike(options) && "collectionName" in options)) {
    mintResult = await mintClass.mintWithCollectionName({
      collectionName: options?.collectionName || "Test collection 1016",
      name: tokenName,
      description: `Description of Mytoken #${randomId}`,
      uri,
    })
    tokenAddress = mintResult.tokenAddress
  } else if (isObjectLike(options) && "collectionAddress" in options) {
    mintResult = await mintClass.mintWithCollectionAddress({
      collectionAddress: options?.collectionAddress,
      name: tokenName,
      description: `Description of Mytoken #${randomId}`,
      uri,
    })
    tokenAddress = mintResult.tokenAddress
  } else {
    throw new Error("Unexpected options")
  }
  return { tokenAddress, tokenName: mintResult.tokenName || tokenName }
}

export async function createTestCollection(state: TestAptosState) {
  const deploy = new AptosNft(state.aptos, state.wallet, state.config)
  const randomId = Math.floor(Math.random() * 100_000_000)
  const uri = "ipfs://QmWYpMyoaUGNRSQbwhw97xM8tcRWm4Et598qtzmzsau7ch/"
  const collectionName = `Test collection #${randomId}`
  const { rariDropAddress, aptosCollectionAddress } = await deploy.createCollection({
    name: collectionName,
    description: "description",
    uri,
  })
  return {
    rariDropAddress,
    aptosCollectionAddress,
    collectionName,
  }
}

export async function createTestCollectionAndMint(state: TestAptosState) {
  const { rariDropAddress, aptosCollectionAddress, collectionName } = await createTestCollection(state)
  const { tokenAddress, tokenName } = await mintTestToken(state, {
    collectionAddress: rariDropAddress,
  })
  return {
    rariDropAddress,
    aptosCollectionAddress,
    collectionAddress: aptosCollectionAddress,
    collectionName,
    tokenAddress,
    tokenName,
  }
}
export async function createV1TokenWithFeePayer(feePayerState: TestAptosState, state: TestAptosState) {
  const createV1NftTx = await state.aptos.transaction.build.simple({
    sender: state.account.accountAddress.toString(),
    withFeePayer: true,
    data: {
      function: `0x1cd6ec749dfd85537f41ea6c07c135532c87ba02b13a709286e352a004657c3a::create_nft_with_resource_account::mint_event_ticket`,
      typeArguments: [],
      functionArguments: [],
    },
  })

  return sendTxWithPayer(feePayerState, state, createV1NftTx)
}

export async function sendTxWithPayer(
  feePayerState: TestAptosState,
  state: TestAptosState,
  transaction: AnyRawTransaction,
) {
  const senderAuthenticator = state.aptos.transaction.sign({
    signer: state.account,
    transaction,
  })
  const feePayerAuthenticator = state.aptos.transaction.signAsFeePayer({
    signer: feePayerState.account,
    transaction,
  })

  const commitedTx = await state.aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator: senderAuthenticator,
    feePayerAuthenticator: feePayerAuthenticator,
  })
  return state.aptos.waitForTransaction({
    transactionHash: commitedTx.hash,
  })
}
export async function createV1Token(state: TestAptosState) {
  const rawTx = {
    function: `0x1cd6ec749dfd85537f41ea6c07c135532c87ba02b13a709286e352a004657c3a::create_nft_with_resource_account::mint_event_ticket`,
    typeArguments: [],
    arguments: [],
  }
  const pendingTx = await state.wallet.signAndSubmitTransaction(rawTx)
  const commitedTx = await state.aptos.waitForTransaction({
    transactionHash: pendingTx.hash,
  })
  if (!("events" in commitedTx)) {
    throw new Error("Mint transaction should consist 'events' field")
  }

  const collectionEvent = commitedTx.events.find(e => e?.type.includes("0x3::token::MintTokenEvent"))
  if (collectionEvent) {
    return {
      tx: commitedTx,
      propertyVersion: collectionEvent.sequence_number,
      collectionName: "Test Collection V1 - Rarible",
      tokenName: "Crypto Cats N2",
      creator: "0x1cd6ec749dfd85537f41ea6c07c135532c87ba02b13a709286e352a004657c3a",
    }
  }
  throw new Error("Mint event has not been found")
}

/**
 *
 * @param state Sender state
 * @param to Receipent
 * @param amount Integer
 */
export async function transferAptosCoins(
  state: {
    aptos: Aptos
    wallet: AptosGenericSdkWallet
  },
  to: string,
  amount: string,
) {
  const transferData = {
    function: "0x1::aptos_account::transfer_coins",
    typeArguments: ["0x1::aptos_coin::AptosCoin"],
    arguments: [to, amount],
  }
  const pendingTx = await state.wallet.signAndSubmitTransaction(transferData)
  return state.aptos.waitForTransaction({
    transactionHash: pendingTx.hash,
  })
}
