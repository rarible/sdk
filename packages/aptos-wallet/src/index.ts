import type { Ed25519PrivateKey } from "@aptos-labs/ts-sdk"
import { Account, Aptos, AptosConfig, Network, NetworkToNetworkName } from "@aptos-labs/ts-sdk"

export class AptosWallet {
	constructor(public readonly account: Account) {}

	static fromPrivateKey(privateKey: Ed25519PrivateKey) {
		return Account.fromPrivateKey({ privateKey })
	}

	signMessage(msg: string) {
		return this.account.sign(msg).toString()
	}

	getPublicKey() {
		return this.account.publicKey.toString()
	}
}

// const privateKey = new Ed25519PrivateKey(process.env.PRIVATE_KEY1)
// const owner = Account.fromPrivateKey({ privateKey })
