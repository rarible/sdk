import type { Observable } from "rxjs"
import { combineLatest } from "rxjs"
import { first, map, mergeMap, startWith } from "rxjs/operators"
import type { ConnectionState } from "@rarible/connector"
import {
  AbstractConnectionProvider,
  cache,
  getStateConnected,
  getStateConnecting,
  getStateDisconnected,
  promiseToObservable,
} from "@rarible/connector"
import type { Maybe } from "@rarible/types"
import { WalletCore } from "@aptos-labs/wallet-adapter-core"
import { PetraWallet } from "petra-plugin-wallet-adapter"
import { getWalletCoreAccountAddress, getWalletCoreAccountNetwork } from "./common"
import type { AptosWalletCoreConnectionResult } from "./domain"

const PROVIDER_ID = "aptos_wallet_core" as const

export class AptosWalletCoreProvider extends AbstractConnectionProvider<
  typeof PROVIDER_ID,
  AptosWalletCoreConnectionResult
> {
  private readonly connection: Observable<ConnectionState<AptosWalletCoreConnectionResult>>
  public readonly instance: Observable<WalletCore>

  constructor() {
    super()
    this.instance = cache(() => this._connect())
    this.connection = this.instance.pipe(
      mergeMap(walletCore => promiseToObservable(getAccountData(walletCore))),
      map(wallet => {
        if (wallet) {
          const disconnect = async () => wallet.provider.disconnect()
          return getStateConnected({ connection: wallet, disconnect })
        } else {
          return getStateDisconnected()
        }
      }),
      startWith(getStateConnecting({ providerId: PROVIDER_ID })),
    )
  }

  async _connect() {
    const petraAdapter = new PetraWallet()
    const walletCore = new WalletCore([petraAdapter], [])
    if (!walletCore.account) {
      await walletCore.connect(petraAdapter.name)
    }
    await walletCore.onNetworkChange()
    await walletCore.onAccountChange()
    return walletCore
  }

  async getCurrentPluginWallet() {
    const core = await this.instance.pipe(first()).toPromise()
    const currentWalletInfo = core.wallet
    if (currentWalletInfo) {
      return core.pluginWallets.find(w => w.name === currentWalletInfo.name)
    }
    return undefined
  }

  getId(): string {
    return PROVIDER_ID
  }

  getConnection(): Observable<ConnectionState<AptosWalletCoreConnectionResult>> {
    return this.connection
  }

  async getOption(): Promise<Maybe<typeof PROVIDER_ID>> {
    return PROVIDER_ID
  }

  async isAutoConnected(): Promise<boolean> {
    return false
  }

  async isConnected(): Promise<boolean> {
    const core = await this.instance.pipe(first()).toPromise()
    return !!core.wallet
  }
}

export async function getAccountData(walletCore: WalletCore) {
  return combineLatest([getWalletCoreAccountAddress(walletCore), getWalletCoreAccountNetwork(walletCore)]).pipe(
    map(([address, network]) => {
      if (address) {
        return {
          provider: walletCore,
          network,
          address,
        }
      } else {
        return undefined
      }
    }),
  )
}

export * from "./domain"
