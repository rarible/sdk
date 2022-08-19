import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import { Box, Stack } from "@mui/material"
import { PrepareBatchBuyResponse } from "@rarible/sdk/build/types/order/fill/domain"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"

interface IBatchBuyFormProps {
	prepare: PrepareBatchBuyResponse
	disabled?: boolean
	onComplete: (response: any) => void
}

export function BatchBuyForm(
	{
		prepare,
		disabled,
		onComplete,
	}: IBatchBuyFormProps,
) {
	const connection = useContext(ConnectorContext)
	const form = useForm()
	const { handleSubmit } = form
	const {
		result,
		setError,
	} = useRequestResult()

	console.log(prepare)
	return (
		<>
			<form onSubmit={handleSubmit(async (formData) => {
				if (!connection.sdk) {
					return
				}

				try {
					onComplete(await prepare.submit(prepare.prepared.map((prepare) => ({
						orderId: prepare.orderId,
						amount: parseInt(formData[prepare.orderId + "_amount"]),
					}))))
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					{
						prepare.prepared.map((prepare) => {
							return <Box key={prepare.orderId}>
								<p>
									OrderId: {prepare.orderId}
								</p>

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
									name={prepare.orderId + "_amount"}
									label="Amount"
								/>
							</Box>
						})
					}

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
