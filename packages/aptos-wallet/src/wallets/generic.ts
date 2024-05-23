import type { Account as GenericAccount, Aptos } from "@aptos-labs/ts-sdk"
import type { MoveFunctionId } from "@aptos-labs/ts-sdk"
import type { AptosTransaction, AptosWalletInterface } from "../domain"
import { isGenericAccount } from "../common"

export class AptosGenericSdkWallet implements AptosWalletInterface {
  constructor(
    public readonly aptos: Aptos,
    public readonly account: GenericAccount,
  ) {
    if (!isGenericAccount(this.account)) {
      throw new Error("Unrecognized wallet")
    }
  }

  async signMessage(msg: string) {
    return this.account.sign(msg).toString()
  }

  async getAccountInfo() {
    return {
      address: this.account.accountAddress.toString(),
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

    return this.aptos.signAndSubmitTransaction({
      signer: this.account,
      transaction: tx,
    })
  }
}

export { GenericAccount }
