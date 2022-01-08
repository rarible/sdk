import type { Observable } from "rxjs"
import { providerRequest } from "./provider-request"
import { getObservable } from "./get-observable"

export function getChainId(provider: any): Observable<number> {
	return getObservable<string, number>(
		provider,
		ethChainId,
		raw => parseInt(raw),
		"chainChanged",
	)
}

async function ethChainId(provider: any): Promise<string> {
	return providerRequest(provider, "eth_chainId")
}
