import { randomWord } from "@rarible/types"
import type { AptosTransaction, AptosWalletInterface, ExternalAccount } from "../domain"
import { isExternalAccount } from "../common"

export class AptosSdkWallet implements AptosWalletInterface {
	constructor(public readonly account: ExternalAccount) {
		if (!isExternalAccount(this.account)) {
			throw new Error("Unrecognized wallet")
		}
	}

	async signMessage(msg: string) {
		const { signature } = await this.account.signMessage({
			message: msg,
			nonce: randomWord(),
		})
		return signature
	}

	async getAccountInfo() {
		const { address, publicKey } = await this.account.account()
		return {
			address,
			publicKey,
		}
	}

	async getPublicKey() {
		const account = await this.account.account()
		return account.publicKey
	}

	async signAndSubmitTransaction(payload: AptosTransaction) {
		return this.account.signAndSubmitTransaction({
			arguments: payload.arguments,
			function: payload.function,
			type_arguments: payload.typeArguments,
		})
	}
}
