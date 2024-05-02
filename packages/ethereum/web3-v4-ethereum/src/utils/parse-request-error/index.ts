import type { ProviderRequestError } from "./domain"
import { ethereumProviderErrors, ethereumRpcErrors } from "./domain"

export function parseRequestError(error: any): ProviderRequestError | undefined {
	if (typeof error === "object" && error !== null && "code" in error) {
		if (ethereumProviderErrors.indexOf(error.code) !== -1 || ethereumRpcErrors.indexOf(error.code) !== -1) {
			return {
				code: error.code,
				...error,
			}
		}
	}
	return undefined
}
