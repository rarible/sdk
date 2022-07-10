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
import { FormFileInput } from "../../components/common/form/form-file-input"
import { UploadMetaResponse } from "@rarible/sdk/build/sdk-blockchains/union/meta/domain"

interface IUploadMEtaFormProps {
	onComplete: (response: UploadMetaResponse) => void
}

export function UploadMetaForm({ onComplete }: IUploadMEtaFormProps) {
	const connection = useContext(ConnectorContext)
	const form = useForm()
	const { handleSubmit } = form
	const { result } = useRequestResult()
	const blockchain = connection.sdk?.wallet?.blockchain!
	const [disabled, setDisabled] = useState(true)

	useEffect(() => {
		const subscription = form.watch(({ name, description, image, accountAddress }) => {
		setDisabled(!(name && description && image.length && accountAddress))
		})
		return () => subscription.unsubscribe()
	}, [form, form.watch])

	return (
		<>
			<form onSubmit={handleSubmit(async (formData) => {
				if (!connection.sdk) {
					return
				}

				const {name, description, image, animationUrl, nftStorageApiKey, accountAddress} = formData
				// try {
					onComplete(await connection.sdk.nft.uploadMeta({
						accountAddress: toUnionAddress(`${blockchain}:${accountAddress}`),
						nftStorageApiKey,
						properties: {
							name,
							description,
							image: image[0],
							animationUrl,
							attributes: [],
						},
						royalty: "",
					}))
				// } catch (e) {
				// 	setError(e)
				// }
			})}
			>
				<Stack spacing={2}>
					<FormTextInput form={form} name="nftStorageApiKey" label="NftStorage Api Key"/>
					<FormTextInput form={form} name="accountAddress" label="Account address"/>
					<FormTextInput form={form} name="name" label="Name"/>
					<FormTextInput form={form} name="description" label="Description"/>
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
