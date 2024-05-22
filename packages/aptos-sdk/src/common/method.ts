import type { Aptos } from "@aptos-labs/ts-sdk"
import type { AnyRawTransaction } from "@aptos-labs/ts-sdk"
import type { CommittedTransactionResponse } from "@aptos-labs/ts-sdk"
import type { Maybe } from "@rarible/types"
import type { AptosWalletInterface } from "@rarible/aptos-wallet/src/domain"
import { getRequiredWallet } from "./index"

export abstract class AptosMethodClass {
  constructor(
    readonly aptos: Aptos,
    readonly wallet: Maybe<AptosWalletInterface>,
  ) {}

  async sendAndWaitTx(tx: AnyRawTransaction): Promise<CommittedTransactionResponse> {
    const pendingMintTx = await this.aptos.signAndSubmitTransaction({
      // @ts-ignore
      signer: getRequiredWallet(this.wallet).account,
      transaction: tx,
    })
    return this.aptos.waitForTransaction({
      transactionHash: pendingMintTx.hash,
    })
  }
}
