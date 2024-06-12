import type { Account as GenericAccount, Aptos } from "@aptos-labs/ts-sdk"
import type { MoveFunctionId } from "@aptos-labs/ts-sdk"
import { normalizeAptosAddress } from "@rarible/sdk-common"
import type { AptosTransaction, AptosWalletInterface } from "../domain"

export class AptosGenericSdkWallet implements AptosWalletInterface {
  constructor(
    public readonly aptos: Aptos,
    public readonly account: GenericAccount,
  ) {}

  async signMessage(msg: string) {
    return this.account.sign(msg).toString()
  }

  async getAccountInfo() {
    return {
      address: normalizeAptosAddress(this.account.accountAddress.toString()),
      publicKey: this.account.publicKey.toString(),
    }
  }

  async signAndSubmitTransaction(payload: AptosTransaction) {
    const tx = await this.aptos.transaction.build.simple({
      sender: this.account.accountAddress,
      data: {
        function: payload.function as MoveFunctionId,
        typeArguments: payload.typeArguments,
        functionArguments: payload.arguments,
      },
    })

    const { hash } = await this.aptos.signAndSubmitTransaction({
      signer: this.account,
      transaction: tx,
    })
    return { hash }
  }
}

export { GenericAccount }
