import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import { Box, Stack } from "@mui/material"
import { Order } from "@rarible/api-client"
import { toItemId } from "@rarible/types"
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

	return (
		<>
			<form onSubmit={handleSubmit(async (formData) => {
				if (!connection.sdk) {
					return
				}

				try {
					onComplete(await prepare.submit(prepare.prepared.map((prepare, i) => {
            const itemsCounter = parseInt(formData[prepare.orderId + "_itemsCounter"] || 1)

            let itemId: any[] = new Array(itemsCounter)
              .fill(0)
              .map((a, i) => {
                console.log('maps, index', prepare.orderId + `_itemId_${i}`, formData[prepare.orderId + `_itemId_${i}`])
                return formData[prepare.orderId + `_itemId_${i}`] ? toItemId(formData[prepare.orderId + `_itemId_${i}`]) : undefined
              })
            console.log('itemId', itemId, 'itemsCounter', itemsCounter)
            return {
              orderId: prepare.orderId,
              amount: parseInt(formData[prepare.orderId + "_amount"]),
              itemId: itemId.length === 1 ? itemId[0] : itemId,
            }
					})))
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					{
						prepare.prepared.map((prepare, i) => {
							return <Box key={prepare.orderId+i}>
								<p>
									OrderId: {prepare.orderId}
								</p>

								<FillRequestForm
									form={form}
									prepare={prepare}
									namePrefix={prepare.orderId}
									order={orders.find((order) => order.id === prepare.orderId)}
                  isFillBatch={true}
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
