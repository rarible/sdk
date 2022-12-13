import React, { useContext } from "react"
import { Box, Stack } from "@mui/material"
import type { PrepareBurnResponse } from "@rarible/sdk/esm/types/nft/burn/domain"
import { useForm } from "react-hook-form"
import { toItemId } from "@rarible/types"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import { useNavigate } from "react-router-dom"

interface IBurnPrepareFormProps {
	disabled?: boolean
	onComplete: (response: PrepareBurnResponse) => void
	itemId: string | undefined
}

export function BurnPrepareForm({ itemId, disabled, onComplete }: IBurnPrepareFormProps) {
	const navigate = useNavigate()
	const connection = useContext(ConnectorContext)
	const form = useForm()
	const { handleSubmit } = form
	const { result, setError } = useRequestResult()

	return (
		<>
			<form onSubmit={handleSubmit(async (formData) => {
				if (!connection.sdk) {
					return
				}
				try {
					onComplete(await connection.sdk.nft.burn.prepare({
						itemId: toItemId(formData.itemId)
					}))
					navigate(`/burn/${formData.itemId}`, {})
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					<FormTextInput form={form} defaultValue={itemId} name="itemId" label="Item ID"/>
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
