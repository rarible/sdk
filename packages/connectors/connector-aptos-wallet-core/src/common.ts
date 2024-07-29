import { Observable, from } from "rxjs"
import { hasCode } from "@rarible/sdk-common"
import type { NetworkInfo, WalletCore } from "@aptos-labs/wallet-adapter-core"
import type { Network } from "@aptos-labs/ts-sdk"
import type { AccountInfo } from "@aptos-labs/wallet-adapter-core"

export function getObservable<Raw, T>(
  provider: any,
  getRaw: (provider: any) => Promise<Raw>,
  mapRaw: (raw: Raw) => T,
  eventName: string,
): Observable<T> {
  if ("on" in provider) {
    return new Observable<T>(subscriber => {
      const handler = (raw: Raw) => {
        subscriber.next(mapRaw(raw))
      }
      getRaw(provider)
        .then(handler)
        .catch(err => subscriber.error(err))
      provider.on(eventName, handler)
    })
  } else {
    return from(
      (async () => {
        const raw = await getRaw(provider)
        return mapRaw(raw)
      })(),
    )
  }
}

export async function setAccountActive(provider: any | undefined) {
  if (!provider) return
  try {
    await provider.account()
  } catch (e) {
    if (hasCode(e) && e.code === 4100) {
      await provider.connect()
    }
  }
}

export function getWalletCoreAccountNetwork(walletCore: WalletCore): Observable<Network> {
  return getObservable<NetworkInfo, Network>(
    walletCore,
    async provider => {
      return await provider.network
    },
    network => {
      return network.name
    },
    "networkChange",
  )
}

export function getWalletCoreAccountAddress(walletCore: WalletCore): Observable<string> {
  return getObservable<AccountInfo, string>(
    walletCore,
    async provider => {
      try {
        return await provider.account
      } catch (e) {}
      return ""
    },
    account => {
      return account?.address
    },
    "accountChange",
  )
}
