import { Observable, from } from "rxjs"
import { hasCode } from "@rarible/sdk-common"
import type { Network } from "./domain"

export function getObservable<Raw, T>(
  provider: any,
  getRaw: (provider: any) => Promise<Raw>,
  mapRaw: (raw: Raw) => T | Promise<T>,
  eventName: string,
): Observable<T> {
  if (eventName in provider) {
    return new Observable<T>(subscriber => {
      const handler = async (raw: Raw) => {
        subscriber.next(await mapRaw(raw))
      }
      getRaw(provider)
        .then(handler)
        .catch(err => subscriber.error(err))
      provider[eventName](handler)
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

export function getAddress(provider: any): Observable<string> {
  return getObservable<{ address: string; publicKey: string }, string>(
    provider,
    async provider => {
      try {
        return await provider.account()
      } catch (e) {}
      return ""
    },
    async account => {
      return account.address
    },
    "onAccountChange",
  )
}

export function getNetwork(provider: any): Observable<Network> {
  return getObservable<Network, Network>(
    provider,
    async provider => {
      return await provider.network()
    },
    network => network,
    "onNetworkChange",
  )
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
