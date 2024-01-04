import type { IConnector } from "@rarible/connector"
import type { IWalletAndAddress } from "@rarible/connector-helper"
import type { PropsWithChildren } from "react"

type ConnectArgs = {
	connector: IConnector<string, IWalletAndAddress>
}

/**
 * Use this component to initiate connector.
 * Later you will be able to use all Rarible SDK hooks to interact with the SDK.
 */
export function Connect(args: PropsWithChildren<ConnectArgs>) {
	return <></>
}