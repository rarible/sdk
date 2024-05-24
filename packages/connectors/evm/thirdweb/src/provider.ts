import { startWith, map, switchMap, shareReplay, first } from "rxjs/operators"
import type { Wallet, WalletId } from "thirdweb/wallets"
import { createThirdwebClient } from "thirdweb"
import { AbstractConnectionProvider, connectToWeb3, getStateConnecting } from "@rarible/connector"
import type { EthereumProviderConnectionResult } from "@rarible/connector"
import type { Observable } from "rxjs"
import { from, of } from "rxjs"
import type { InAppWalletCreationOptions } from "thirdweb/dist/types/wallets/in-app/core/wallet/types"
import type { ThirdwebProviderConfig } from "./domain"
import { EIP1193ProviderAdapter } from "./to-eip-1193"

const PROVIDER_ID = "thirdweb" as const

export class ThirdwebBaseProvider<Id extends WalletId> extends AbstractConnectionProvider<
  ThirdwebProviderId<Id>,
  EthereumProviderConnectionResult
> {
  protected readonly client = getClient(this.config)

  protected readonly adapter$ = this.wallet$.pipe(
    map(wallet => new EIP1193ProviderAdapter(this.config.defaultChain, this.client, wallet, this.config.options)),
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
    const adapter = await this.adapter$.pipe(first()).toPromise()
    return Boolean(adapter.wallet.getAccount())
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

function getClient(config: ThirdwebProviderConfig<WalletId>) {
  if ("client" in config) return config.client
  return createThirdwebClient(config)
}
