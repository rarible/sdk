import { concat, NEVER, Observable, of } from "rxjs"

type ConnectStatus = "connected" | "disconnected"

interface ProviderInterface {
  on: (event: string, handler: () => void) => void
  removeListener: (event: string, handler: () => void) => void
}

export function getConnectedStatus(provider: ProviderInterface): Observable<ConnectStatus> {
  if ("on" in provider) {
    return new Observable<ConnectStatus>(subscriber => {
      subscriber.next("connected")
      function handler() {
        subscriber.next("disconnected")
      }
      provider.on("disconnected", handler)
      if ("removeListener" in provider) {
        subscriber.add(() => {
          provider.removeListener("disconnected", handler)
        })
      }
    })
  } else {
    return concat(of("connected" as const), NEVER)
  }
}
