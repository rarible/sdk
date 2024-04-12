import type {
	Account,
	Aptos,
} from "@aptos-labs/ts-sdk"
import { AptosMethodClass } from "../common/method"

export class AptosDeploy extends AptosMethodClass {
	constructor(readonly aptos: Aptos, readonly account: Account) {
		super(aptos, account)
	}

	createCollection = async (
		name: string, description: string, uri: string
	) => {
		const createCollectionTransaction = await this.aptos.createCollectionTransaction({
			name,
			description,
			uri,
			creator: this.account,
		})
		const tx = await this.sendAndWaitTx(createCollectionTransaction)

		const collectionChange = tx.changes.find(state => {
			return state.type === "write_resource" &&
        "data" in state && typeof state.data === "object" && state.data !== null &&
        "type" in state.data &&
        typeof state.data.type === "string" && state.data.type === "0x4::collection::Collection"
		})
		if (!(collectionChange && "address" in collectionChange)) {
			throw new Error("Collection address has not been found")
		}

		return {
			tx,
			collectionAddress: collectionChange.address,
		}
	}

}
