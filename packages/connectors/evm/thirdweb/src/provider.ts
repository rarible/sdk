import { startWith, map, switchMap, shareReplay, first } from "rxjs/operators"
import type { Wallet, WalletId } from "thirdweb/wallets"
import { AbstractConnectionProvider, connectToWeb3, getStateConnecting } from "@rarible/connector"
import type { EthereumProviderConnectionResult } from "@rarible/connector"
import type { Observable } from "rxjs"
import { combineLatest, from, of } from "rxjs"
import type { InAppWalletCreationOptions } from "thirdweb/dist/types/wallets/in-app/core/wallet/types"
import type { ThirdwebProviderConfig } from "./domain"
import { EIP1193ProviderAdapter } from "./to-eip-1193"
import { thirdwebPkg$ } from "./utils"

const PROVIDER_ID = "thirdweb" as const

export class ThirdwebBaseProvider<Id extends WalletId> extends AbstractConnectionProvider<
  ThirdwebProviderId<Id>,
  EthereumProviderConnectionResult
> {
  protected readonly client$ = of(null).pipe(
    map(() => this.config),
    switchMap(x => {
      if ("client" in x) return of(x.client)
      return thirdwebPkg$.pipe(map(pkg => pkg.createThirdwebClient(x)))
    }),
    shareReplay(1),
  )

  protected readonly adapter$ = combineLatest([this.wallet$, this.client$]).pipe(
    map(
      ([wallet, client]) => new EIP1193ProviderAdapter(this.config.defaultChain, client, wallet, this.config.options),
    ),
    shareReplay(1),
  )

  private readonly connection$ = this.adapter$.pipe(
    switchMap(adapter =>
      from(adapter.enable()).pipe(
        switchMap(() =>
          connectToWeb3(adapter, {
            disconnect: () => adapter.wallet.disconnect(),
          }),
        ),
      ),
    ),
    startWith(
      getStateConnecting({
        providerId: PROVIDER_ID,
      }),
    ),
  )

  constructor(
    private readonly id: Id,
    private readonly config: ThirdwebProviderConfig<Id>,
    private readonly wallet$: Observable<Wallet<Id>>,
  ) {
    super()
  }

  getId = () => PROVIDER_ID

  getConnection = () => this.connection$

  isAutoConnected = async () => false

  getOption = async () => getProviderId(this.id)

  isConnected = async () => {
    try {
      const adapter = await this.adapter$.pipe(first()).toPromise()
      const accounts = await adapter.request({ method: "eth_accounts" })
      return accounts.length > 0
    } catch (error) {
      console.warn("Can't check whether provider connected or not", error)
      return false
    }
  }
}

export class ThirdwebInAppProvider extends ThirdwebBaseProvider<"inApp"> {
  constructor(config: ThirdwebProviderConfig<"inApp">, options: InAppWalletCreationOptions = {}) {
    super(
      "inApp",
      config,
      of(null).pipe(
        switchMap(() => import("thirdweb/wallets")),
        map(x => x.createWallet("inApp", options)),
        shareReplay(1),
      ),
    )
  }
}

type ThirdwebProviderId<T extends WalletId> = `thirdweb-${T}`
function getProviderId<T extends WalletId>(id: T): ThirdwebProviderId<T> {
  return `thirdweb-${id}`
}
