import { randomWord } from "@rarible/types"
import { normalizeAptosAddress } from "@rarible/sdk-common"
import type { AptosTransaction, AptosWalletInterface, ExternalAccount } from "../domain"
import { normalizeAptosNetwork } from "./common"

export class AptosSdkWallet implements AptosWalletInterface {
  constructor(public readonly account: ExternalAccount) {}

  async signMessage(msg: string, options?: { nonce: string }) {
    const { signature, fullMessage } = await this.account.signMessage({
      message: msg,
      nonce: options?.nonce || randomWord(),
    })
    if (Array.isArray(signature)) {
      return {
        signature: signature[0].toString(),
        message: fullMessage,
      }
    }
    return {
      signature: signature.toString(),
      message: fullMessage.toString(),
    }
  }

  async getAccountInfo() {
    if (!this.account.account) throw new Error("Cannot get account info: account has not been set")
    const { address, publicKey } = await this.account.account()
    return {
      address: normalizeAptosAddress(address),
      publicKey: Array.isArray(publicKey) ? publicKey[0] : publicKey.toString(),
      network: normalizeAptosNetwork(await this.account.network()),
    }
  }

  async getPublicKey() {
    const account = await this.getAccountInfo()
    return account.publicKey
  }

  async signAndSubmitTransaction(payload: AptosTransaction) {
    const { hash } = await this.account.signAndSubmitTransaction({
      arguments: payload.arguments,
      function: payload.function,
      type_arguments: payload.typeArguments,
    })
    return { hash }
  }
}
