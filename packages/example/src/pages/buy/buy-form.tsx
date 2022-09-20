import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import type { Order } from "@rarible/api-client"
import { Box, Stack } from "@mui/material"
import { PrepareFillResponse } from "@rarible/sdk/build/types/order/fill/domain"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import { FillRequestForm } from "../../components/common/sdk-forms/fill-request-form"
import { toItemId } from "@rarible/types/build/item-id"

interface IBuyFormProps {
	prepare: PrepareFillResponse
	order: Order,
	disabled?: boolean
	onComplete: (response: any) => void
}

export function BuyForm(
	{
		prepare,
		order,
		disabled,
		onComplete,
	}: IBuyFormProps,
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
						itemId: formData.itemId ? toItemId(formData.itemId) : undefined,
					}))
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					<FillRequestForm form={form} prepare={prepare} order={order}/>
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
