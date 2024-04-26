import { isObjectLike } from "@rarible/sdk-common"
import type { Account as GenericAccount } from "@aptos-labs/ts-sdk"
import type { ExternalAccount } from "../domain"

export function isExternalAccount(x: unknown): x is ExternalAccount {
	return isObjectLike(x) && "signMessage" in x && "signAndSubmitTransaction" in x
}

export function isGenericAccount(x: unknown): x is GenericAccount {
	return isObjectLike(x) && "signWithAuthenticator" in x && "sign" in x
}
