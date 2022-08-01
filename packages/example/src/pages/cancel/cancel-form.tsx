import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import { Box, Stack } from "@mui/material"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"

interface ICancelFormProps {
	disabled?: boolean
	onComplete: (response: any) => void
}

export function CancelForm(
	{
		disabled,
		onComplete,
	}: ICancelFormProps,
) {
	const connection = useContext(ConnectorContext)
	const form = useForm()
	const { handleSubmit } = form
	const {
		result,
		setError,
	} = useRequestResult()

	return (
		<>
			<form onSubmit={handleSubmit(async (formData) => {
				if (!connection.sdk) {
					return
				}

				try {
					onComplete(await connection.sdk.order.cancel({
						orderId: formData.orderId,
					}))
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					<FormTextInput form={form} name="orderId" label="Order ID"/>
					<Box>
						<FormSubmit
							form={form}
							label="Submit"
							state={resultToState(result.type)}
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
