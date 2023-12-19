import React, { useContext } from "react"
import { Box, Stack } from "@mui/material"
import { useForm } from "react-hook-form"
import type { PrepareMintResponse } from "@rarible/sdk/build/types/nft/mint/prepare"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import { Blockchain } from "@rarible/api-client"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { useSdk } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import { EnvironmentContext } from "../../components/connector/environment-selector-provider"
import { useConnect } from "../../connector/context"

interface IMintPrepareFormProps {
	disabled?: boolean,
	onComplete: (response: PrepareMintResponse) => void
}

export function MintPrepareForm({ disabled, onComplete }: IMintPrepareFormProps) {
	const sdk = useSdk()
	const connect = useConnect()
	const { environment } = useContext(EnvironmentContext)

	const form = useForm()
	const { handleSubmit } = form
	const { result, setError } = useRequestResult()

	return (
		<>
			<form onSubmit={handleSubmit(async (formData) => {
				if (!sdk) {
					return
				}
				try {
					const collection = await sdk.apis.collection.getCollectionById({
						collection: formData.collectionId,
					})
					onComplete(await sdk.nft.mint.prepare({ collection }))
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					<FormTextInput form={form} name="collectionId" label="Collection ID" defaultValue={connect.status === "connected" ? getDefaultCollection(environment, connect.blockchain): ""}/>
					<Box>
						<FormSubmit
							form={form}
							label="Next"
							state={resultToState(result.type)}
							icon={faChevronRight}
							disabled={disabled}
						/>
					</Box>
				</Stack>
			</form>
			<Box sx={{ my: 2 }}>
				<RequestResult result={result}/>
			</Box>
		</>
	)
}

function getDefaultCollection(env: RaribleSdkEnvironment, blockchain: Blockchain) {
	console.log("env", env, blockchain, getDefaultETHCollection(env))
	switch (blockchain) {
		case Blockchain.ETHEREUM: return `${blockchain}:${getDefaultETHCollection(env)}`
		default: return ""
	}
}
function getDefaultETHCollection(env: RaribleSdkEnvironment) {
	switch (env) {
		case "development":
			return "0x6972347e66A32F40ef3c012615C13cB88Bf681cc"
		case "testnet":
			return "0xD8560C88D1DC85f9ED05b25878E366c49B68bEf9"
		case "staging":
			return "0xBf558E78CfdE95AfbF17a4ABe394Cb2cC42E6270"
		case "prod":
			return "0xc9154424B823b10579895cCBE442d41b9Abd96Ed"
		default:
			return ""
	}
}
