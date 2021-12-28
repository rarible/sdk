import { Observable } from "rxjs"
import type Web3 from "web3"
import type { EthereumWallet } from "../domain"
import { isListenable, isWithRemoveSubscriber } from "../../../common/utils"
import { getStateConnected, STATE_DISCONNECTED } from "../../../connection-state"
import type { ConnectionState } from "../../../connection-state"

export function connectToWeb3(web3: Web3, provider: any, options: {
	disconnect?: () => Promise<void>
} = {}): Observable<ConnectionState<EthereumWallet>> {
	return new Observable<ConnectionState<EthereumWallet>>(subscriber => {
		const disconnect = () => {
			subscriber.next(STATE_DISCONNECTED)
		}

		if (isListenable(provider)) {
			const externalDisconnectHandler = () => {
				disconnect()
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
				const wallet: EthereumWallet = { chainId, address, provider: web3 }
				subscriber.next(getStateConnected({ connection: wallet, disconnect: options.disconnect }))
			} else {
				disconnect()
			}
		}).catch(() => {
			disconnect()
		})
	})
}