import { of, throwError } from "rxjs"
import type { SolanaProviderAdapter } from "@rarible/connector-solana"
import { SolanaInjectableProvider } from "@rarible/connector-solana"
import { pollUntilConditionMetOrMaxAttempts } from "@rarible/connector/build/common/utils"
import type { SolanaProvider, SolanaSigner } from "@rarible/solana-common"
import { switchMap, take } from "rxjs/operators"
import type { PublicKey } from "@solana/web3.js"
import type { SalmonProvider, WindowWithSalmonProvider } from "./domain"

const SALMON_CONNECTION_KEY = "salmon_connected"

export class SalmonConnectionProvider extends SolanaInjectableProvider<string> {
  private readonly providerName
  constructor(name = "salmon") {
    super(
      name,
      of(null).pipe(
        switchMap(() => pollUntilConditionMetOrMaxAttempts(() => extractSalmonProvider(), 100, 10)),
        switchMap(x => (x ? of(x) : throwError(new SalmonWalletIsNotDetected()))),
        switchMap(x => of(new SalmonProviderAdapter(x))),
        take(1),
      ),
    )
    this.providerName = name
  }

  isAutoConnected = async () => {
    return localStorage.getItem(SALMON_CONNECTION_KEY) === "true"
  }

  // @ts-expect-error
  getOption = async () => {
    return extractSalmonProvider() ? this.providerName : undefined
  }
}

class SalmonProviderAdapter implements SolanaProviderAdapter {
  readonly provider: SolanaProvider
  constructor(private readonly rawProvider: SalmonProvider) {
    this.provider = {
      on: rawProvider.on.bind(rawProvider),
      removeListener: rawProvider.removeListener.bind(rawProvider),
      isConnected: () => Boolean(rawProvider.isConnected),
      connect: async () => {
        localStorage.setItem(SALMON_CONNECTION_KEY, "true")
        return {
          initialPublicKey: await rawProvider.connect().then(x => x.publicKey),
        }
      },
      disconnect: async () => {
        localStorage.setItem(SALMON_CONNECTION_KEY, "false")
        return this.rawProvider.disconnect()
      },
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

class SalmonWalletIsNotDetected extends Error {
  constructor() {
    super("Salmon wallet extension is not detected")
    this.name = "SalmonWalletIsNotDetected"
  }
}

function extractSalmonProvider(): SalmonProvider | undefined {
  if (typeof window === "undefined") {
    console.warn("Window environment is required")
    return undefined
  }
  return (window as WindowWithSalmonProvider).salmon
}
