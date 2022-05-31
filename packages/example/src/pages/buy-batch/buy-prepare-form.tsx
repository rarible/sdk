import React, { useContext } from "react"
import { Box, Button, Stack } from "@mui/material"
import { useForm } from "react-hook-form"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import {
	PrepareBatchFillResponse,
	PreparedFillBatchRequest,
	PrepareFillBatchRequestWithAmount,
	PrepareFillRequest,
} from "@rarible/sdk/build/types/order/fill/domain"

interface IBuyPrepareFormProps {
	disabled?: boolean
	onComplete: (response: PrepareBatchFillResponse) => void
	orders: (PrepareFillBatchRequestWithAmount & { orderId: string })[]
	currentOrder: (PreparedFillBatchRequest & { amount?: number }) | null
	prepareOrder: (request: PrepareFillRequest) => Promise<void>
	addToBatch: (request: PrepareFillBatchRequestWithAmount & { orderId: string }) => void
}

export function BuyBatchPrepareForm({
																			disabled,
																			onComplete,
																			orders,
																			currentOrder,
																			prepareOrder,
																			addToBatch,
																		}: IBuyPrepareFormProps) {
	const connection = useContext(ConnectorContext)
	const form = useForm()
	const { handleSubmit } = form
	const {
		result,
		setError,
	} = useRequestResult()

	return (
		<Stack spacing={2}>
			<form onSubmit={handleSubmit(async (formData) => {
				const {
					orderId,
					amount,
				} = formData
				if (!connection.sdk) {
					return
				}
				try {
					if (orderId && !amount) {
						await prepareOrder({ orderId: formData.orderId })
					} else if (currentOrder) {
						await addToBatch({
							...currentOrder,
							orderId,
							amount,
						})
						form.reset()
					} else {
						throw new Error("Should never happen")
					}

				} catch (e) {
					setError(e)
				}
			})}>
				<Stack spacing={2}>
					<FormTextInput form={form} name="orderId" label="Order ID" disabled={false}/>
					<Box>
						<FormSubmit
							form={form}
							label="Prepare order"
							state={resultToState(result.type)}
							disabled={disabled || !!currentOrder}
						/>
					</Box>
					<FormTextInput
						type="number"
						inputProps={{
							min: 1,
							max: currentOrder?.maxAmount,
							step: 1,
						}}
						form={form}
						options={{
							min: 1,
							max: Number(currentOrder?.maxAmount),
						}}
						name="amount"
						label="Amount"
						disabled={!currentOrder}
					/>
					<Box>
						<FormSubmit
							form={form}
							label="Add to batch"
							state={resultToState(result.type)}
							disabled={disabled || !currentOrder}
						/>
					</Box>
				</Stack>
			</form>
			{orders.length ? <Box>
				<Button
					variant="contained"
					onClick={async () => {
						onComplete(await connection?.sdk?.order.buyBatch(orders)!)
					}}>
					Next
				</Button>
			</Box> : null}
			<Box sx={{ my: 2 }}>
				<RequestResult result={result}/>
			</Box>
		</Stack>
	)
}
