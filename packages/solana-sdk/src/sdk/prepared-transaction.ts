import type { Connection, Commitment } from "@solana/web3.js"
import type { IWalletSigner } from "@rarible/solana-wallet"
import type { ITransactionPreparedInstructions } from "../common/transactions"
import type { TransactionResult } from "../types"
import { sendTransactionWithRetry } from "../common/transactions"
import type { DebugLogger } from "../logger/debug-logger"

export class PreparedTransaction {
	constructor(
		private readonly connection: Connection,
		public readonly data: ITransactionPreparedInstructions,
		public readonly signer: IWalletSigner,
		private readonly logger: DebugLogger,
		public readonly onSubmit?: (tx: TransactionResult) => void
	) {
	}

	public async submit(commitment: Commitment): Promise<TransactionResult> {
		const res = await sendTransactionWithRetry(
			this.connection,
			this.signer,
			this.data.instructions,
			this.data.signers,
			commitment,
			this.logger
		)

		this.onSubmit?.(res)

		return res
	}
}