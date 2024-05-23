import { of, throwError } from "rxjs"
import type { SolanaProviderAdapter } from "@rarible/connector-solana"
import { SolanaInjectableProvider } from "@rarible/connector-solana"
import { pollUntilConditionMetOrMaxAttempts } from "@rarible/connector/build/common/utils"
import type { SolanaProvider, SolanaSigner } from "@rarible/solana-common"
import { switchMap, take } from "rxjs/operators"
import type { PublicKey } from "@solana/web3.js"
import type { PhantomConnectOptions, PhantomProvider, WindowWithPhantomProvider } from "./domain"

export class PhantomConnectionProvider extends SolanaInjectableProvider<"phantom"> {
  constructor(config: PhantomConnectOptions = {}) {
    super(
      "phantom",
      of(null).pipe(
        switchMap(() => pollUntilConditionMetOrMaxAttempts(() => extractPhantomProvider(), 100, 10)),
        switchMap(x => (x ? of(x) : throwError(new PhantomWalletIsNotDetected()))),
        switchMap(x => of(new PhantomProviderAdapter(config, x))),
        take(1),
      ),
    )
  }

  isAutoConnected = async () => false
}

class PhantomProviderAdapter implements SolanaProviderAdapter {
  readonly provider: SolanaProvider
  constructor(
    config: PhantomConnectOptions,
    private readonly rawProvider: PhantomProvider,
  ) {
    this.provider = {
      on: rawProvider.on.bind(rawProvider),
      removeListener: rawProvider.removeListener.bind(rawProvider),
      isConnected: () => Boolean(rawProvider.isConnected),
      connect: async () => ({
        initialPublicKey: await rawProvider.connect(config).then(x => x.publicKey),
      }),
    }
  }

  toSigner = (publicKey: PublicKey): SolanaSigner => ({
    publicKey,
    signAllTransactions: this.rawProvider.signAllTransactions.bind(this.rawProvider),
    signTransaction: this.rawProvider.signTransaction.bind(this.rawProvider),
    signMessage: async (...args) => ({
      publicKey,
      signature: await this.rawProvider.signMessage(...args).then(x => x.signature),
    }),
  })
}

class PhantomWalletIsNotDetected extends Error {
  constructor() {
    super("Phantom wallet extension is not detected")
    this.name = "PhantomWalletIsNotDetected"
  }
}

function extractPhantomProvider(): PhantomProvider | undefined {
  if (typeof window === "undefined") {
    console.warn("Window environment is required")
    return undefined
  }
  return (window as WindowWithPhantomProvider).phantom?.solana
}
