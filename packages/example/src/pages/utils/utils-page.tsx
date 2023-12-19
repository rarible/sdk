import React from "react"
import { WalletType } from "@rarible/sdk-wallet"
import { Page } from "../../components/page"
import { useSdk } from "../../components/connector/sdk-connection-provider"
import { SetupCollection } from "./components/setup-collection"
import { SetupMattelCollections } from "./components/setup-mattel-collections"
import { SardineCheckout } from "./components/sardine-checkout"
import { ExecuteRawTransaction } from "./components/execute-raw-transaction"
import { SignTypedDataUtil } from "./components/sign-typed-data"
import { ProviderActions } from "./components/provider-actions"
import { TransactionData } from "./components/transaction-data"
import { SardineOfframp } from "./components/sardine-offramp"


export function UtilsPage() {
	const sdk = useSdk()
	const blockchain = sdk?.wallet?.walletType
	const isFlowActive = blockchain === WalletType.FLOW
	const isEVMActive = blockchain === WalletType.ETHEREUM

	return (
		<Page header="Utils page">
			{
				isFlowActive && <FlowUtils/>
			}
			{
				isEVMActive && <EVMUtils/>
			}

			<TransactionData />
			<SardineOfframp />
		</Page>
	)

}
export function FlowUtils() {
	return (
		<>
			<SetupCollection />
			<SetupMattelCollections />
			<SardineCheckout />
			<ExecuteRawTransaction />
		</>
	)
}

export function EVMUtils() {
	return (
		<>
			<SignTypedDataUtil />
			<ProviderActions/>
		</>
	)
}
