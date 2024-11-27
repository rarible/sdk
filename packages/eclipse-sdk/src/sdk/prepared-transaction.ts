import type { Connection, Commitment } from "@solana/web3.js"
import type { SolanaSigner } from "@rarible/solana-common"
import type { ITransactionPreparedInstructions } from "../common/transactions"
import type { TransactionResult } from "../types"
import { sendTransactionWithRetry } from "../common/transactions"
import type { DebugLogger } from "../logger/debug-logger"

export class PreparedTransaction {
  constructor(
    private readonly connection: Connection,
    public readonly data: ITransactionPreparedInstructions,
    public readonly signer: SolanaSigner,
    private readonly logger?: DebugLogger,
    public readonly onSubmit?: (tx: TransactionResult) => void,
  ) {}

  submit = async (commitment: Commitment): Promise<TransactionResult> => {
    const res = await sendTransactionWithRetry(
      this.connection,
      this.signer,
      this.data.instructions,
      this.data.signers,
      commitment,
      this.logger,
    )

    this.onSubmit?.(res)
    return { ...res, orderId: this.data.orderId }
  }
}
