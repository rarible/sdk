import type {
	Account,
	Aptos,
} from "@aptos-labs/ts-sdk"
import type { AnyRawTransaction } from "@aptos-labs/ts-sdk"

export abstract class AptosMethodClass {
	constructor(
		readonly aptos: Aptos,
		readonly account: Account
	) {
	}

	async sendAndWaitTx(tx: AnyRawTransaction) {
		const pendingMintTx = await this.aptos.signAndSubmitTransaction({
			signer: this.account,
			transaction: tx,
		})
		return this.aptos.waitForTransaction({
			transactionHash: pendingMintTx.hash,
		})
	}
}
