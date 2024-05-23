import { Blockchain } from "@rarible/api-client"
import type { IBlockchainTransaction } from "../domain"

export class BlockchainImmutableXTransaction implements IBlockchainTransaction {
  blockchain: Blockchain = Blockchain.IMMUTABLEX

  constructor(public transaction: number | undefined) {}

  hash() {
    return (this.transaction ?? "") + ""
  }

  async wait() {
    return {
      blockchain: this.blockchain,
      hash: this.hash(),
    }
  }

  getTxLink() {
    if (!this.transaction) {
      return ""
    }

    return "https://immutascan.io/tx/" + this.transaction
  }

  get isEmpty(): boolean {
    return this.transaction === undefined
  }
}
