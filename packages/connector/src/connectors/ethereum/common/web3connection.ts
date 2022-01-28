import type { Observable } from "rxjs"
import { combineLatest } from "rxjs"
import { map } from "rxjs/operators"
import type { EthereumProviderConnectionResult } from "../domain"
import type { ConnectionState } from "../../../connection-state"
import { getStateConnected, getStateDisconnected } from "../../../connection-state"
import { getAddress } from "./get-address"
import { getChainId } from "./get-chain-id"
import { getConnectedStatus } from "./get-connected-status"

export function connectToWeb3(
	provider: any,
	options: {
		disconnect?: () => Promise<void>
	} = {}
): Observable<ConnectionState<EthereumProviderConnectionResult>> {
	return combineLatest([
		getAddress(provider),
		getChainId(provider),
		getConnectedStatus(provider),
	]).pipe(
		map(([address, chainId, status]) => {
			if (status === "connected" && address) {
				const wallet: EthereumProviderConnectionResult = {
					chainId,
					address,
					provider,
					disconnect: options.disconnect,
				}
				return getStateConnected({ connection: wallet })
			} else {
				return getStateDisconnected()
			}
		}),
	)
}
