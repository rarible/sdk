import React, { useContext } from "react"
import { WalletType } from "@rarible/sdk-wallet"
import { Page } from "../../components/page"
import { SdkConnectionProvider, SdkContext } from "../../components/connector/sdk-connection-provider"
import { SetupCollection } from "./components/setup-collection"
import { SetupMattelCollections } from "./components/setup-mattel-collections"
import { SardineCheckout } from "./components/sardine-checkout"
import { ExecuteRawTransaction } from "./components/execute-raw-transaction"
import { SignTypedDataUtil } from "./components/sign-typed-data"
import { ProviderActions } from "./components/provider-actions"
import { TransactionData } from "./components/transaction-data"
import { SardineOfframp } from "./components/sardine-offramp"


export function UtilsPage() {
	const connection = useContext(SdkContext)
	const blockchain = connection.sdk?.wallet?.walletType
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
