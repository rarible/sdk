import type {
	Account,
	Aptos,
} from "@aptos-labs/ts-sdk"
import { isChangeBelongsToType } from "../common"
import { AptosMethodClass } from "../common/method"
export class AptosMint extends AptosMethodClass {
	constructor(readonly aptos: Aptos, readonly account: Account) {
		super(aptos, account)
	}

	mint = async (
		collectionName: string,
		name: string,
		description: string,
		uri: string
	) => {
		const mintTokenTransaction = await this.aptos.mintDigitalAssetTransaction({
			description,
			name,
			uri,
			creator: this.account,
			collection: collectionName,
		})
		const tx = await this.sendAndWaitTx(mintTokenTransaction)

		const mintChange = tx.changes.find(changeItem =>
			isChangeBelongsToType(changeItem, (type) => type === "0x4::token::Token")
		)
		if (!mintChange || !("address" in mintChange)) {
			throw new Error("Collection address has not been found")
		}

		return {
			tx,
			tokenAddress: mintChange.address,
		}
	}
}
