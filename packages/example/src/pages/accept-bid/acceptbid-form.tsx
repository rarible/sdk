import { useForm } from "react-hook-form"
import { Box, Stack } from "@mui/material"
import type { PrepareFillResponse } from "@rarible/sdk/build/types/order/fill/domain"
import { MaxFeesBasePointSupport } from "@rarible/sdk/build/types/order/fill/domain"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { RequestResult } from "../../components/common/request-result"
import { useSdkContext } from "../../components/connector/sdk"

interface IAcceptBidFormProps {
	prepare: PrepareFillResponse
	disabled?: boolean
	onComplete: (response: any) => void
}

export function AcceptBidForm({ prepare, disabled, onComplete }: IAcceptBidFormProps) {
	const connection = useSdkContext()
	const form = useForm()
	const { handleSubmit } = form
	const { result, setError } = useRequestResult()

	return (
		<>
			<form onSubmit={handleSubmit(async (formData) => {
				if (!connection.sdk) {
					return
				}

				let maxFeesBasePoint: number | undefined = undefined
				if (prepare.maxFeesBasePointSupport === MaxFeesBasePointSupport.REQUIRED) {
					maxFeesBasePoint = 1000
				}

				try {
					onComplete(await prepare.submit({
						amount: parseInt(formData.amount),
						maxFeesBasePoint,
					}))
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					<FormTextInput
						type="number"
						inputProps={{ min: 1, max: prepare.maxAmount, step: 1 }}
						form={form}
						options={{
							min: 1,
							max: Number(prepare.maxAmount),
						}}
						name="amount"
						label="Amount"
					/>
					<Box>
						<FormSubmit form={form} label="Submit" state={resultToState(result.type)} disabled={disabled}/>
					</Box>
				</Stack>
			</form>
			<Box sx={{ my: 2 }}>
				<RequestResult result={result}/>
			</Box>
		</>
	)
}
