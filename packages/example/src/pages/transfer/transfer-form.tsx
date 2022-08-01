import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import { PrepareTransferResponse } from "@rarible/sdk/build/types/nft/transfer/domain"
import { Box, Stack } from "@mui/material"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import { toUnionAddress } from "@rarible/types"

interface ITransferFormProps {
	disabled?: boolean
	onComplete: (response: any) => void
	prepare: PrepareTransferResponse
}

export function TransferForm(
	{
		disabled,
		onComplete,
		prepare
	}: ITransferFormProps,
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
					onComplete(await prepare.submit({
						amount: parseInt(formData.amount),
						to: toUnionAddress(formData.to),
					}))
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					<FormTextInput form={form} name="to" label="Receiver Address"/>
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
							label="Transfer"
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
