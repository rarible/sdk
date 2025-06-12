import type { Ethereum } from "@rarible/ethereum-provider"
import type { Fcl } from "@rarible/fcl-types"
import { TextEncoder } from "text-encoding"
import type { AuthWithPrivateKey } from "@rarible/flow-sdk"
import type { ImxWallet } from "@rarible/immutable-wallet"
import type { SolanaSigner } from "@rarible/solana-common"
import type { AptosWalletInterface } from "@rarible/aptos-wallet"
import type { AbstractWallet, UserSignature } from "./domain"
import { WalletType } from "./domain"

export class EthereumWallet<T extends Ethereum = Ethereum> implements AbstractWallet<WalletType.ETHEREUM> {
  readonly walletType = WalletType.ETHEREUM

  constructor(public readonly ethereum: T) {}

  async signPersonalMessage(message: string): Promise<UserSignature> {
    const address = await this.ethereum.getFrom()
    if (!address) throw new Error("Not connected to Ethereum blockchain")
    return {
      message,
      signature: await this.ethereum.personalSign(message),
      publicKey: address,
    }
  }
}

export class FlowWallet implements AbstractWallet<WalletType.FLOW> {
  readonly walletType = WalletType.FLOW

  constructor(
    public readonly fcl: Fcl,
    public auth?: AuthWithPrivateKey,
  ) {}

  getAuth(): AuthWithPrivateKey {
    return this.auth
  }

  async signPersonalMessage(message: string): Promise<UserSignature> {
    if (!message.length) {
      throw new Error("Message can't be empty")
    }
    const messageHex = Buffer.from(message).toString("hex")
    if (this.auth) {
      return {
        message,
        ...(await this._getSignatureFromAuth(messageHex)),
      }
    }
    const currentUser = this.fcl.currentUser()
    const user = await this.fcl.currentUser().snapshot()
    const address = user.addr
    if (!address) {
      throw new Error("Not connected to Flow blockchain")
    }
    const account = await this.fcl.account(address)

    const signatures = await currentUser.signUserMessage(messageHex)
    if (typeof signatures === "string") {
      throw new Error(signatures)
    }

    const signature = signatures.find(s => {
      return s.addr.toLowerCase() === address.toLowerCase()
    })
    if (signature) {
      const pubKey = account.keys.find(k => k.index === signature.keyId)
      if (!pubKey) {
        throw new Error(`Key with index "${signature.keyId}" not found on account with address ${address}`)
      }
      return {
        message,
        signature: signature.signature,
        publicKey: pubKey.publicKey,
      }
    }
    throw new Error(`Signature of user address "${address}" not found`)
  }

  async _getSignatureFromAuth(msgHex: string) {
    if (!this.auth) throw new Error("Auth was not been passed")
    const authResult = await this.auth()
    const signResult = await authResult.signingFunction({
      message: msgHex,
      addr: authResult.addr,
    })
    if (!signResult || !signResult.signature) {
      throw new Error(`Signature of user address "${authResult.addr}" not found`)
    }
    const account = await this.fcl.account(authResult.addr)
    const pubKey = account.keys.find(k => k.index === signResult.keyId)
    if (!pubKey) {
      throw new Error(`Key with index "${signResult.keyId}" not found on account with address ${authResult.addr}`)
    }
    return {
      signature: signResult.signature,
      publicKey: pubKey.publicKey,
    }
  }
}

export class SolanaWallet implements AbstractWallet<WalletType.SOLANA> {
  readonly walletType = WalletType.SOLANA

  constructor(public readonly provider: SolanaSigner) {}

  async signPersonalMessage(message: string): Promise<UserSignature> {
    const data = new TextEncoder().encode(message)
    const result = await this.provider.signMessage(data, "utf8")
    return {
      message,
      signature: Buffer.from(result.signature).toString("hex"),
      publicKey: result.publicKey.toString(),
    }
  }
}

export class ImmutableXWallet implements AbstractWallet<WalletType.IMMUTABLEX> {
  readonly walletType = WalletType.IMMUTABLEX

  constructor(public wallet: ImxWallet) {}

  async signPersonalMessage(message: string): Promise<UserSignature> {
    return {
      message,
      signature: (await this.wallet.link.sign({ message, description: message })).result,
      publicKey: this.wallet.getConnectionData().address,
    }
  }
}

export class AptosWallet implements AbstractWallet<WalletType.APTOS> {
  readonly walletType = WalletType.APTOS

  constructor(public wallet: AptosWalletInterface) {}

  async signPersonalMessage(message: string): Promise<UserSignature> {
    const accountInfo = await this.wallet.getAccountInfo()
    const signResponse = await this.wallet.signMessage(message)
    return {
      message: signResponse.message,
      signature: signResponse.signature,
      publicKey: accountInfo.publicKey,
    }
  }
}

export function isBlockchainWallet(x: unknown): x is BlockchainWallet {
  return typeof x === "object" && x !== null && "signPersonalMessage" in x && "walletType" in x
}

export type BlockchainWallet<T extends WalletType = WalletType> = {
  [WalletType.FLOW]: FlowWallet
  [WalletType.ETHEREUM]: EthereumWallet
  [WalletType.SOLANA]: SolanaWallet
  [WalletType.IMMUTABLEX]: ImmutableXWallet
  [WalletType.APTOS]: AptosWallet
}[T]

export type WalletByBlockchain = {
  [K in WalletType]: BlockchainWallet<K>
}
