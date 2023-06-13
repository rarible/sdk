import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import type { Order } from "@rarible/api-client"
import { Box, Stack } from "@mui/material"
import type { PrepareOrderUpdateResponse } from "@rarible/sdk/build/types/order/common"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import { PriceForm } from "../../components/common/sdk-forms/price-form"

interface ISellUpdateFormProps {
	prepare: PrepareOrderUpdateResponse
	order: Order,
	disabled?: boolean
	onComplete: (response: any) => void
}

export function SellUpdateForm(
	{
		prepare,
		disabled,
		onComplete,
	}: ISellUpdateFormProps,
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
						price: formData.price,
						// amount: parseInt(formData.amount),
						// itemId: formData.itemId ? toItemId(formData.itemId) : undefined,
					}))
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					<PriceForm form={form}/>
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
