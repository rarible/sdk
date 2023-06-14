import React, { useContext } from "react"
import type { IRaribleSdk } from "@rarible/sdk/build/domain"
import { CircularProgress } from "@mui/material"
import type { UnionAddress } from "@rarible/types/build/union-address"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { EnvironmentContext } from "../../components/connector/environment-selector-provider"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { ConvertForm, isAvailableWethConvert } from "./convert-form"
import { useGetBalance } from "./hooks/use-get-balance"
import { getCurrenciesForBlockchain } from "./utils/currencies"

interface INativeBalanceProps {
	sdk: IRaribleSdk,
	wallet: BlockchainWallet,
	walletAddress: UnionAddress,
}

export function NativeBalance({ sdk, wallet, walletAddress }: INativeBalanceProps) {
	const { environment } = useContext(EnvironmentContext)
	const connection = useContext(ConnectorContext)
	const currencies = getCurrenciesForBlockchain(wallet.walletType, environment, connection)
	const { balance, fetching, error } = useGetBalance(
		sdk,
		walletAddress,
		currencies.find((c) => c.isNative)?.getAssetType()!
	)
	const isAvailableConvert = isAvailableWethConvert(wallet.walletType, environment)

	const content = () => {
		if (fetching) {
			return <CircularProgress size={14}/>
		} else if (error) {
			return <b>{error.message}</b>
		} else {
			return <>{balance}</>
		}
	}

	return (
		<>
			<div style={{ marginBottom: 20 }}>
				Native Balance: {content()}
			</div>
			{
				isAvailableConvert && <ConvertForm sdk={sdk} walletAddress={walletAddress} />
			}
		</>

	)
}
