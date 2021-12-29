import { Observable } from "rxjs"
import type Web3 from "web3"
import type { EthereumProviderConnectionResult } from "../domain"
import { isListenable, isWithRemoveSubscriber } from "../../../common/utils"
import type { ConnectionState } from "../../../connection-state"
import { getStateConnected, getStateDisconnected } from "../../../connection-state"
import { Blockchain } from "../../../common/provider-wallet"

export function connectToWeb3(web3: Web3, provider: any, options: {
	disconnect?: () => Promise<void>
} = {}): Observable<ConnectionState<EthereumProviderConnectionResult>> {
	return new Observable<ConnectionState<EthereumProviderConnectionResult>>(subscriber => {
		if (isListenable(provider)) {
			const externalDisconnectHandler = () => {
				subscriber.next(getStateDisconnected())
			}

			provider.on("disconnected", externalDisconnectHandler)
			if (isWithRemoveSubscriber(provider)) {
				subscriber.add(() => {
					provider.removeListener("disconnected", externalDisconnectHandler)
				})
			}
		}

		Promise.all([web3.eth.getAccounts(), web3.eth.getChainId()]).then(([accounts, chainId]) => {
			const address = accounts[0]
			if (address) {
				const wallet: EthereumProviderConnectionResult = {
					blockchain: Blockchain.ETHEREUM,
					chainId,
					address,
					provider: web3,
				}
				subscriber.next(getStateConnected({ connection: wallet, disconnect: options.disconnect }))
			} else {
				subscriber.next(getStateDisconnected())
			}
		}).catch((err) => {
			subscriber.next(getStateDisconnected({ error: err.toString() }))
		})
	})
}