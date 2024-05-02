import { useForm } from "react-hook-form"
import type { Order } from "@rarible/api-client"
import { Box, Stack } from "@mui/material"
import type { PrepareFillResponse } from "@rarible/sdk/build/types/order/fill/domain"
import { toItemId } from "@rarible/types/build/item-id"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { RequestResult } from "../../components/common/request-result"
import { FillRequestForm } from "../../components/common/sdk-forms/fill-request-form"

interface IBuyFormProps {
	prepare: PrepareFillResponse
	order: Order,
	disabled?: boolean
	onComplete: (response: any) => void
}

export function BuyForm({ prepare, order, disabled, onComplete }: IBuyFormProps) {
	const form = useForm()
	const { result, setError } = useRequestResult()

	return (
		<>
			<form onSubmit={form.handleSubmit(async (formData) => {
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
