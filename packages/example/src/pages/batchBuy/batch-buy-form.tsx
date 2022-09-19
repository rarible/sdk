import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import { Box, Stack } from "@mui/material"
import { Order } from "@rarible/api-client"
import { PrepareBatchBuyResponse } from "@rarible/sdk/build/types/order/fill/domain"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import { FillRequestForm } from "../../components/common/sdk-forms/fill-request-form"

interface IBatchBuyFormProps {
	prepare: PrepareBatchBuyResponse
	orders: Order[],
	disabled?: boolean
	onComplete: (response: any) => void
}

export function BatchBuyForm(
	{
		prepare,
		orders,
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

	console.log(orders)

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

								<FillRequestForm
									form={form}
									prepare={prepare}
									namePrefix={prepare.orderId}
									order={orders.find((order) => order.id === prepare.orderId)}
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
