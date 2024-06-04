import type { MoveFunctionId } from "@aptos-labs/ts-sdk"
import { WalletCore } from "@aptos-labs/wallet-adapter-core"
import { randomWord } from "@rarible/types"
import { normalizeAddress } from "@rarible/sdk-common"
import type { AptosTransaction, AptosWalletInterface } from "../domain"

export class AptosWalletCore implements AptosWalletInterface {
  constructor(public readonly wallet: WalletCore) {}

  async signMessage(message: string) {
    const response = await this.wallet.signMessage({
      message,
      nonce: randomWord(),
    })
    if (Array.isArray(response.signature)) {
      return response.signature[0]
    }
    return response.signature.toString()
  }

  async getAccountInfo() {
    const accountInfo = this.wallet.account
    if (!accountInfo) {
      throw new Error("AccountInfo does not exist")
    }
    return {
      address: normalizeAddress(accountInfo.address),
      publicKey: Array.isArray(accountInfo.publicKey) ? accountInfo.publicKey[0] : accountInfo.publicKey,
    }
  }

  async signAndSubmitTransaction(payload: AptosTransaction) {
    const { hash } = await this.wallet.signAndSubmitTransaction({
      data: {
        functionArguments: payload.arguments,
        function: payload.function as MoveFunctionId,
        typeArguments: payload.typeArguments,
      },
    })
    return { hash }
  }
}

export { WalletCore }
