import { randomWord } from "@rarible/types"
import { normalizeAptosAddress } from "@rarible/sdk-common"
import type { AptosTransaction, AptosWalletInterface, ExternalAccount } from "../domain"

export class AptosSdkWallet implements AptosWalletInterface {
  constructor(public readonly account: ExternalAccount) {}

  async signMessage(msg: string) {
    const { signature } = await this.account.signMessage({
      message: msg,
      nonce: randomWord(),
    })
    if (Array.isArray(signature)) {
      return signature[0]
    }
    return signature.toString()
  }

  async getAccountInfo() {
    const { address, publicKey } = await this.account.account()
    return {
      address: normalizeAptosAddress(address),
      publicKey,
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
