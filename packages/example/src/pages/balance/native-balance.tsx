import React, { useContext } from "react"
import type { IRaribleSdk } from "@rarible/sdk/build/domain"
import { CircularProgress } from "@mui/material"
import { getCurrenciesForBlockchain } from "./utils/currencies"
import { UnionAddress } from "@rarible/types/build/union-address"
import { useGetBalance } from "./hooks/use-get-balance"
import { BlockchainWallet } from "@rarible/sdk-wallet"
import { EnvironmentContext } from "../../components/connector/environment-selector-provider";

interface INativeBalanceProps {
	sdk: IRaribleSdk,
	wallet: BlockchainWallet,
	walletAddress: UnionAddress,
}

export function NativeBalance({sdk, wallet, walletAddress}: INativeBalanceProps) {
  const {environment} = useContext(EnvironmentContext)
  const currencies = getCurrenciesForBlockchain(wallet.walletType, environment)
	const { balance, fetching, error } = useGetBalance(
		sdk,
		walletAddress,
		currencies.find((c) => c.isNative)?.getAssetType()!
	)

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
		<div>
			Native Balance: {content()}
		</div>
	)
}
