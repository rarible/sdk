import React, { useContext, useState } from "react"
import { Box, IconButton, Stack } from "@mui/material"
import type { Order } from "@rarible/api-client"
import { useForm } from "react-hook-form"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import { toOrderId } from "@rarible/types"
import { PrepareBatchBuyResponse } from "@rarible/sdk/build/types/order/fill/domain"

interface IBatchBuyPrepareFormProps {
	disabled?: boolean
	onComplete: (response: { prepare: PrepareBatchBuyResponse, orders: Order[] }) => void
	orderId: string | undefined
}

export function BatchBuyPrepareForm({ orderId, disabled, onComplete }: IBatchBuyPrepareFormProps) {
	const [inputsCount, setInputsCount] = useState(2)
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
					console.log('formData', formData)
					onComplete({
						prepare: await connection.sdk.order.batchBuy.prepare(
							formData.orderId.filter((id: string) => id).map((id: string) => {
								return {
									orderId: toOrderId(id),
								}
							})
						),
						orders: (await connection.sdk.apis.order.getOrdersByIds({
							orderIds: {
								ids: formData.orderId.filter((id: string) => id)
							},
						})).orders,
					})
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					{
						(new Array(inputsCount)).fill(0).map((v, i) => {
							return <FormTextInput key={i} form={form} defaultValue={orderId} name={`orderId[${i}]`} label="Order ID"/>
						})
					}
					<Box
						display="flex"
						justifyContent="flex-end"
						alignItems="flex-end"
					>
						<IconButton
							color="primary"
							onClick={() => setInputsCount(inputsCount + 1)}
						>
							<AddCircleOutlineIcon/>
						</IconButton>
						<IconButton
							color="error"
							disabled={inputsCount <= 1}
							onClick={() => setInputsCount(Math.max(1, inputsCount - 1))}
						>
							<RemoveCircleOutlineIcon/>
						</IconButton>
					</Box>
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
