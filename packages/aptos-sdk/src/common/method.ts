import type {
	Aptos,
} from "@aptos-labs/ts-sdk"
import type { AnyRawTransaction } from "@aptos-labs/ts-sdk"
import type { CommittedTransactionResponse } from "@aptos-labs/ts-sdk"
import type { Maybe } from "@rarible/types"
import type { AptosWallet } from "@rarible/aptos-wallet"
import { getRequiredWallet } from "./index"

export abstract class AptosMethodClass {
	constructor(
		readonly aptos: Aptos,
		readonly wallet: Maybe<AptosWallet>
	) {
	}

	async sendAndWaitTx(tx: AnyRawTransaction): Promise<CommittedTransactionResponse> {
		const pendingMintTx = await this.aptos.signAndSubmitTransaction({
			signer: getRequiredWallet(this.wallet).account,
			transaction: tx,
		})
		return this.aptos.waitForTransaction({
			transactionHash: pendingMintTx.hash,
		})
	}
}
