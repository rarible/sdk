import React, { useContext } from "react"
import { Box, Stack } from "@mui/material"
import { useForm } from "react-hook-form"
import { PrepareFillResponse } from "@rarible/sdk/build/types/order/fill/domain"
import { toOrderId } from "@rarible/types"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import { useNavigate } from "react-router-dom"

interface IAcceptBidPrepareFormProps {
	disabled?: boolean
	onComplete: (response: PrepareFillResponse) => void
	orderId: string | undefined
}

export function AcceptBidPrepareForm({ orderId, disabled, onComplete }: IAcceptBidPrepareFormProps) {
	const navigate = useNavigate()
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
					onComplete(await connection.sdk.order.acceptBid.prepare({
						orderId: toOrderId(formData.orderId)
					}))
					navigate(`/accept-bid/${formData.orderId}`, {})
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					<FormTextInput form={form} defaultValue={orderId} name="orderId" label="Order ID"/>
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
