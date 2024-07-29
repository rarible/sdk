import type { CommittedTransactionResponse, Ed25519Account } from "@aptos-labs/ts-sdk"
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

  return {
    aptos,
    account,
    wallet: new AptosGenericSdkWallet(aptos, account),
    config: envConfig,
    transferAPT: transferAPT.bind(null, aptos, account),
  }
}

export type TestAptosState = {
  aptos: Aptos
  account: Ed25519Account
  wallet: AptosGenericSdkWallet
  config: AddressConfig
  transferAPT: (recepient: string, amount: number) => Promise<CommittedTransactionResponse>
}

async function transferAPT(aptos: Aptos, senderAccount: Ed25519Account, recepient: string, amount: number) {
  const sendAptTx = await aptos.transferCoinTransaction({
    sender: senderAccount.accountAddress,
    recipient: recepient,
    amount,
  })
  const pendingTxn = await aptos.signAndSubmitTransaction({
    signer: senderAccount,
    transaction: sendAptTx,
  })
  return aptos.waitForTransaction({
    transactionHash: pendingTxn.hash,
  })
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
  let tokenAddress
  if (!options || (isObjectLike(options) && "collectionName" in options)) {
    const mintResult = await mintClass.mintWithCollectionName({
      collectionName: options?.collectionName || "Test collection 1016",
      name: `Mytoken #${randomId}`,
      description: `Description of Mytoken #${randomId}`,
      uri,
    })
    tokenAddress = mintResult.tokenAddress
  } else if (isObjectLike(options) && "collectionAddress" in options) {
    const mintResult = await mintClass.mintWithCollectionAddress({
      collectionAddress: options?.collectionAddress,
      name: `Mytoken #${randomId}`,
      description: `Description of Mytoken #${randomId}`,
      uri,
    })
    tokenAddress = mintResult.tokenAddress
  } else {
    throw new Error("Unexpected options")
  }
  return tokenAddress
}

export async function createTestCollection(state: TestAptosState) {
  const deploy = new AptosNft(state.aptos, state.wallet, state.config)
  const randomId = Math.floor(Math.random() * 100_000_000)
  const uri = "ipfs://QmWYpMyoaUGNRSQbwhw97xM8tcRWm4Et598qtzmzsau7ch/"
  const { rariDropAddress, aptosCollectionAddress } = await deploy.createCollection({
    name: `Test collection #${randomId}`,
    description: "description",
    uri,
  })
  return {
    rariDropAddress,
    aptosCollectionAddress,
  }
}

export async function createTestCollectionAndMint(state: TestAptosState) {
  const { rariDropAddress, aptosCollectionAddress } = await createTestCollection(state)
  const tokenAddress = await mintTestToken(state, {
    collectionAddress: rariDropAddress,
  })
  return {
    rariDropAddress,
    aptosCollectionAddress,
    collectionAddress: aptosCollectionAddress,
    tokenAddress,
  }
}
