import React, { useContext, useEffect, useState } from "react"
import { Box, Stack } from "@mui/material"
import { useForm } from "react-hook-form"
import { toUnionAddress } from "@rarible/types"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import { UploadedFile } from "@rarible/sdk/build/sdk-blockchains/union/meta/domain"
import { FormFileInput } from "../../components/common/form/form-file-input"

const nftStorageApiKey = process.env["REACT_APP_NFT_STORAGE_API_KEY"]

interface IUploadMEtaFormProps {
	onComplete: (response: UploadedFile) => void
}

export function UploadMetaForm({ onComplete }: IUploadMEtaFormProps) {
	const connection = useContext(ConnectorContext)
	const form = useForm()
	const { handleSubmit } = form
	const { result, setError } = useRequestResult()
	const blockchain = connection.sdk?.wallet?.blockchain!
	const [disabled, setDisabled] = useState(true)

	useEffect(() => {
		const subscription = form.watch(({ name, description, image, tokenAddress }) => {
		setDisabled(!(name && description && image.length && tokenAddress))
		})
		return () => subscription.unsubscribe()
	}, [form, form.watch])

	return (
		<>
			<form onSubmit={handleSubmit(async (formData) => {
				if (!connection.sdk) {
					return
				}
				if (!nftStorageApiKey) {
					throw new Error("Please provide REACT_APP_NFT_STORAGE_API_KEY in environment variables")
				}
				const {name, description, image, animationUrl, tokenAddress} = formData
				try {
					onComplete(await connection.sdk.nft.uploadMeta({
						nftStorageApiKey,
						properties: {
							name,
							description,
							image: image[0],
							animationUrl,
							attributes: [],
						},
						tokenAddress: toUnionAddress(`${blockchain}:${tokenAddress}`),
						royalty: "",
					}))
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					<FormTextInput form={form} name="name" label="Name"/>
					<FormTextInput form={form} name="description" label="Description"/>
					<FormTextInput form={form} name="tokenAddress" label="Token address"/>
					<FormFileInput form={form} name="image"/>
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
