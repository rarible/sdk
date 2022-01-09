import type { Observable } from "rxjs"
import { providerRequest } from "./provider-request"
import { getObservable } from "./get-observable"

export function getAddress(provider: any): Observable<string | undefined> {
	return getObservable<string[], string | undefined>(
		provider,
		ethAccounts,
		([account]) => account,
		"accountsChanged",
	)
}

export async function ethAccounts(provider: any): Promise<string[]> {
	return providerRequest(provider, "eth_accounts")
}
