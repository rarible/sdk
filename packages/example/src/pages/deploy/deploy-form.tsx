import React, { useContext } from "react"
import { useForm, useWatch } from "react-hook-form"
import { BlockchainGroup } from "@rarible/api-client"
import { Box } from "@mui/material"
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
	}) ?? connection.sdk?.wallet?.blockchain

	switch (blockchain) {
		case BlockchainGroup.ETHEREUM:
			return <EthereumDeployForm form={form}/>
		case BlockchainGroup.TEZOS:
			return <TezosDeployForm form={form}/>
		case BlockchainGroup.SOLANA:
			return <SolanaDeployForm form={form}/>
		default:
			return <Box sx={{my: 2}}>Deploy not available for selected blockchain</Box>
	}
}
