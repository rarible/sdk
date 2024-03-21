import type { IRaribleSdk } from "@rarible/sdk/build/domain"
import { CircularProgress } from "@mui/material"
import type { UnionAddress } from "@rarible/types/build/union-address"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { useEnvironmentContext } from "../../components/connector/env"
import { useSdkContext } from "../../components/connector/sdk"
import { ConvertForm, isAvailableWethConvert } from "./convert-form"
import { useGetBalance } from "./hooks/use-get-balance"
import { getCurrenciesForBlockchain } from "./utils/currencies"

interface INativeBalanceProps {
	sdk: IRaribleSdk,
	wallet: BlockchainWallet,
	walletAddress: UnionAddress,
}

export function NativeBalance({ sdk, wallet, walletAddress }: INativeBalanceProps) {
	const { environment } = useEnvironmentContext()
	const connection = useSdkContext()
	const currencies = getCurrenciesForBlockchain(wallet.walletType, environment, connection)
	const { balance, fetching, error } = useGetBalance(
		sdk,
		walletAddress,
		currencies.find((c) => c.isNative)?.getAssetType()!
	)

	const isMantleNetwork = (connection.state as any)?.connection.blockchain === Blockchain.MANTLE
	const isAvailableConvert = !isMantleNetwork && isAvailableWethConvert(wallet.walletType, environment)

	const content = () => {
		if (fetching) return <CircularProgress size={14}/>
		if (error) return <b>{error.message}</b>
		return <>{balance}</>
	}

	return (
		<>
			<div style={{ marginBottom: 20 }}>
				Native Balance: {content()}
			</div>
			{isAvailableConvert ? <ConvertForm sdk={sdk} walletAddress={walletAddress} /> : null}
		</>

	)
}
