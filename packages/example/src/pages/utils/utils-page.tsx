import React, { useContext } from "react"
import { WalletType } from "@rarible/sdk-wallet"
import { Page } from "../../components/page"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { SetupCollection } from "./components/setup-collection"
import { SetupMattelCollections } from "./components/setup-mattel-collections"
import { SardineCheckout } from "./components/sardine-checkout"
import { ExecuteRawTransaction } from "./components/execute-raw-transaction"

export function UtilsPage() {
	const connection = useContext(ConnectorContext)
	const blockchain = connection.sdk?.wallet?.walletType
	const isFlowActive = blockchain === WalletType.FLOW

	return (
		<Page header="Utils page">
			{
				isFlowActive && <FlowUtils/>
			}
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
