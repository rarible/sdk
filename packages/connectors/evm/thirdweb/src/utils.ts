import { of } from "rxjs"
import { shareReplay, switchMap } from "rxjs/operators"

export const thirdwebPkg$ = of(null).pipe(
  switchMap(() => import("thirdweb")),
  shareReplay(1),
)

export const thirdwebRpc$ = of(null).pipe(
  switchMap(() => import("thirdweb/rpc")),
  shareReplay(1),
)

export const thirdwebChains$ = of(null).pipe(
  switchMap(() => import("thirdweb/chains")),
  shareReplay(1),
)

const accountsKey = "rarible:thirdweb-connector:accountkey"

export function getSavedAccounts(): string[] {
  if (typeof window !== "undefined") {
    try {
      const saved = window.localStorage.getItem(accountsKey)
      if (saved !== null) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          return parsed as string[]
        }
      }
    } catch (error) {
      console.warn(
        "Can't get saved accounts from local storage, you may try to reset your local storage in browser",
        error,
      )
    }
  } else {
    // Here we might have SSR support but shall we?
  }

  return []
}

export function setSavedAccounts(accounts: string[]) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(accountsKey, JSON.stringify(accounts))
    } catch (error) {
      console.warn("Can't set saved accounts to local storage", error)
    }
  } else {
    // Here we might have SSR support but shall we?
  }
}
