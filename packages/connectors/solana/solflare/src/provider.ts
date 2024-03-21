import type { SolanaProviderAdapter } from "@rarible/connector-solana"
import type { SolanaProvider, SolanaSigner } from "@rarible/solana-common"
import type { PublicKey } from "@solana/web3.js"
import { SolanaInjectableProvider } from "@rarible/connector-solana"
import type { SolflareConfig } from "@solflare-wallet/sdk/src/types"
import { from, of } from "rxjs"
import { switchMap, take } from "rxjs/operators"
import type Solflare from "@solflare-wallet/sdk/lib/esm"

export class SolflareConnectionProvider extends SolanaInjectableProvider<"solflare"> {
	constructor(private readonly options: SolflareConfig = {}) {
		super("solflare", of(null).pipe(
			switchMap(() => from(this.initializeSdk())),
			switchMap(x => of(new SolflareProviderAdapter(x))),
			take(1),
		))
	}

	isAutoConnected = async () => false

	private async initializeSdk() {
		const { default: SolflareSdk } = await import("@solflare-wallet/sdk/lib/esm")
		return new SolflareSdk(this.options)
	}
}

class SolflareProviderAdapter implements SolanaProviderAdapter {
	readonly provider: SolanaProvider
	constructor(private readonly rawProvider: Solflare) {
		this.provider = {
			on: rawProvider.on.bind(rawProvider),
			removeListener: rawProvider.off.bind(rawProvider),
			isConnected: () => Boolean(rawProvider.isConnected),
			connect: async () => {
				await rawProvider.connect()
				const initialPublicKey = rawProvider.publicKey
				if (!initialPublicKey) {
					throw new Error("Solflare couldn't establish connection")
				}
				return {
					initialPublicKey,
				}
			},
		}
	}

	toSigner = (publicKey: PublicKey): SolanaSigner => ({
		publicKey,
		signAllTransactions: this.rawProvider.signAllTransactions.bind(this.rawProvider),
		signTransaction: this.rawProvider.signTransaction.bind(this.rawProvider),
		signMessage: async (...args) => ({
			publicKey,
			signature: await this.rawProvider.signMessage(...args),
		}),
	})
}