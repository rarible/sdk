import React, { useContext } from "react"
import { useForm, useWatch } from "react-hook-form"
import { Box } from "@mui/material"
import { WalletType } from "@rarible/sdk-wallet"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { EthereumDeployForm } from "./ethereum-deploy-form"
import { TezosDeployForm } from "./tezos-deploy-form"
import { SolanaDeployForm } from "./solana-deploy-form"

interface IDeployFormProps {
	form: ReturnType<typeof useForm>
}

export function DeployForm({ form }: IDeployFormProps) {
	const connection = useContext(ConnectorContext)
	const blockchain = useWatch({
		control: form.control,
		name: "blockchain",
	}) ?? connection.sdk?.wallet?.walletType

	switch (blockchain) {
		case WalletType.ETHEREUM:
			return <EthereumDeployForm form={form}/>
		case WalletType.TEZOS:
			return <TezosDeployForm form={form}/>
		case WalletType.SOLANA:
			return <SolanaDeployForm form={form}/>
		default:
			return <Box sx={{my: 2}}>Deploy not available for selected blockchain</Box>
	}
}
