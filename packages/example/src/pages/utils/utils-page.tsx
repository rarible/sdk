import { WalletType } from "@rarible/sdk-wallet"
import { Page } from "../../components/page"
import { useSdkContext } from "../../components/connector/sdk"
import { SetupCollection } from "./components/setup-collection"
import { SetupMattelCollections } from "./components/setup-mattel-collections"
import { SardineCheckout } from "./components/sardine-checkout"
import { ExecuteRawTransaction } from "./components/execute-raw-transaction"
import { SignTypedDataUtil } from "./components/sign-typed-data"
import { ProviderActions } from "./components/provider-actions"
import { TransactionData } from "./components/transaction-data"
import { SardineOfframp } from "./components/sardine-offramp"

export function UtilsPage() {
  const connection = useSdkContext()
  const blockchain = connection.sdk.wallet?.walletType

  return (
    <Page header="Utils page">
      {blockchain === WalletType.FLOW && <FlowUtils />}
      {blockchain === WalletType.ETHEREUM && <EVMUtils />}
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
      <ProviderActions />
    </>
  )
}
