import type { Observable } from "rxjs"
import { combineLatest, defer } from "rxjs"
import { map, mergeMap, startWith } from "rxjs/operators"
import type { ConnectionState } from "@rarible/connector"
import {
  AbstractConnectionProvider,
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
  public readonly walletCore: WalletCore

  constructor() {
    super()
    const petraAdapter = new PetraWallet()
    this.walletCore = new WalletCore([petraAdapter], [])
    this.connection = defer(async () => {
      if (!this.walletCore.account) {
        await this.walletCore.connect(petraAdapter.name)
      }
      await this.walletCore.onNetworkChange()
      await this.walletCore.onAccountChange()
    }).pipe(
      mergeMap(() => promiseToObservable(getAccountData(this.walletCore))),
      map(wallet => {
        if (wallet) {
          const disconnect = async () => this.walletCore.disconnect()
          return getStateConnected({ connection: wallet, disconnect })
        } else {
          return getStateDisconnected()
        }
      }),
      startWith(getStateConnecting({ providerId: PROVIDER_ID })),
    )
  }

  getId(): string {
    return PROVIDER_ID
  }

  getConnection(): Observable<ConnectionState<AptosWalletCoreConnectionResult>> {
    return this.connection
  }

  async getOption(): Promise<Maybe<any>> {
    return "Petra"
  }

  async isAutoConnected(): Promise<boolean> {
    return false
  }

  async isConnected(): Promise<boolean> {
    return !!this.walletCore.wallet
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
