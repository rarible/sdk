import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import { PrepareBurnResponse } from "@rarible/sdk/build/types/nft/burn/domain"
import { Alert, AlertTitle, Box, Stack } from "@mui/material"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"

interface IBurnFormProps {
	disabled?: boolean
	onComplete: (response: any) => void
	prepare: PrepareBurnResponse
}

export function BurnForm(
	{
		disabled,
		onComplete,
		prepare
	}: IBurnFormProps,
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
			<Alert severity="warning" sx={{my: 2}}>
				<AlertTitle>Warning</AlertTitle>
				Submitting this form will destroy token
			</Alert>
			<form onSubmit={handleSubmit(async (formData) => {
				if (!connection.sdk) {
					return
				}

				try {
					onComplete(await prepare.submit({
						amount: parseInt(formData.amount),
					}))
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					<FormTextInput
						type="number"
						inputProps={{
							min: 1,
							max: prepare.maxAmount,
							step: 1,
						}}
						form={form}
						options={{
							min: 1,
							max: Number(prepare.maxAmount),
						}}
						name="amount"
						label="Amount"
					/>
					<Box>
						<FormSubmit
							form={form}
							label="Burn"
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
