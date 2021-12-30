import { Observable } from "rxjs"
import type { EthereumProviderConnectionResult } from "../domain"
import { isListenable, isWithRemoveSubscriber } from "../../../common/utils"
import type { ConnectionState } from "../../../connection-state"
import { getStateConnected, getStateDisconnected } from "../../../connection-state"
import { Blockchain } from "../../../common/provider-wallet"
import { getWeb3Accounts, getWeb3ChainId } from "./web3helpers"

export function getJsonRpcWalletInfoProvider(provider: any): IWalletInfoProvider {
	return {
		getAccounts: () => getWeb3Accounts(provider),
		getChainId: () => getWeb3ChainId(provider),
	}
}

interface IWalletInfoProvider {
	getAccounts: () => Promise<string[]>
	getChainId: () => Promise<number>
}

export function connectToWeb3(
	networkInfoProvider: IWalletInfoProvider,
	walletProvider: any,
	web3SourceProvider: any,
	options: {
		disconnect?: () => Promise<void>
	} = {}
): Observable<ConnectionState<EthereumProviderConnectionResult>> {
	return new Observable<ConnectionState<EthereumProviderConnectionResult>>(subscriber => {
		if (isListenable(walletProvider)) {
			const externalDisconnectHandler = () => {
				subscriber.next(getStateDisconnected())
			}

			walletProvider.on("disconnected", externalDisconnectHandler)
			if (isWithRemoveSubscriber(walletProvider)) {
				subscriber.add(() => {
					walletProvider.removeListener("disconnected", externalDisconnectHandler)
				})
			}
		}

		Promise.all([networkInfoProvider.getAccounts(), networkInfoProvider.getChainId()]).then(([accounts, chainId]) => {
			const address = accounts[0]
			if (address) {
				const wallet: EthereumProviderConnectionResult = {
					blockchain: Blockchain.ETHEREUM,
					chainId,
					address,
					provider: web3SourceProvider,
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