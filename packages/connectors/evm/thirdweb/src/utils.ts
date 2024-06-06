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
