import React, { useContext, useState } from "react"
import { Box, Button, Stack } from "@mui/material"
import { useForm } from "react-hook-form"
import { PrepareFillResponse } from "@rarible/sdk/build/types/order/fill/domain"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import { useNavigate } from "react-router-dom"

interface IBatchBuyPrepareFormProps {
	disabled?: boolean
	onComplete: (response: PrepareFillResponse) => void
	orderId: string | undefined
}

export function BatchBuyPrepareForm({ orderId, disabled, onComplete }: IBatchBuyPrepareFormProps) {
	const navigate = useNavigate()
	const [inputsCount, setInputsCount] = useState(1)
	const connection = useContext(ConnectorContext)
	const form = useForm()
	const { handleSubmit } = form
	const { result, setError } = useRequestResult()

	console.log((new Array(inputsCount)).fill(0).map((v, i) => {
		return <FormTextInput key={i} form={form} defaultValue={orderId} name={`orderId[${i}]`} label="Order ID"/>
	}))
	return (
		<>
			<form onSubmit={handleSubmit(async (formData) => {
				if (!connection.sdk) {
					return
				}
				try {
					console.log(formData)
					// onComplete(await connection.sdk.order.buy({
					//
					// 	orderId: toOrderId(formData.orderId)
					// }))
					//navigate(`/buy/${formData.orderId}`, {})
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

					<Box>
						<Button onClick={() => setInputsCount(inputsCount + 1)}>+</Button>
						<Button onClick={() => setInputsCount(Math.max(1, inputsCount - 1))}>-</Button>
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
