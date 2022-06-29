import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import { Box, Stack } from "@mui/material"
import { PrepareFillBatchResponse } from "@rarible/sdk/build/types/order/fill/domain"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import { toOrderId } from "@rarible/types"

interface IBuyBatchPrepareFormProps {
	prepare: PrepareFillBatchResponse
	disabled?: boolean
	onComplete: (response: any) => void
}

export function BuyBatchPrepareForm({
													prepare,
													disabled,
													onComplete,
												}: IBuyBatchPrepareFormProps) {
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
					onComplete(await prepare.submit(Object.entries(prepare.preparedOrders).map(([orderId]) => {
						return {
							orderId: toOrderId(orderId),
							amount: formData[orderId],
						}
					})))
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					{Object.entries(prepare.preparedOrders).map(([orderId, preparedOrder]) => {
						return <FormTextInput
							type="number"
							inputProps={{
								min: 1,
								max: preparedOrder.maxAmount,
								step: 1,
							}}
							form={form}
							options={{
								min: 1,
								max: Number(preparedOrder.maxAmount),
							}}
							key={orderId}
							name={orderId}
							label={`Amount for order: ${orderId}`}
						/>
					})}
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
