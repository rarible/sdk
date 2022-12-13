import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import { Box, Stack } from "@mui/material"
import type { PrepareOrderResponse } from "@rarible/sdk/esm/types/order/common"
import { MaxFeesBasePointSupport } from "@rarible/sdk/esm/types/order/fill/domain"
import { toBigNumber } from "@rarible/types"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import { getCurrency } from "../../common/get-currency"

interface ISellFormProps {
	onComplete: (response: any) => void
	prepare: PrepareOrderResponse
	disabled?: boolean
}

export function SellForm({ prepare, disabled, onComplete }: ISellFormProps) {
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

				let maxFeesBasePoint: number | undefined = undefined
				if (prepare.maxFeesBasePointSupport === MaxFeesBasePointSupport.REQUIRED) {
					maxFeesBasePoint = 1000
				}

				try {
					onComplete(await prepare.submit({
						price: toBigNumber(formData.price),
						amount: parseInt(formData.amount),
						currency: getCurrency(prepare.supportedCurrencies[0]),
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
						inputProps={{ min: 0, step: "any" }}
						form={form}
						options={{
							min: 0
						}}
						name="price"
						label="Price"
					/>
					<FormTextInput
						type="number"
						inputProps={{ min: 1, max: prepare.maxAmount, step: 1 }}
						form={form}
						options={{
							min: 1,
							max: Number(prepare.maxAmount)
						}}
						defaultValue={Math.min(1, Number(prepare.maxAmount))}
						name="amount"
						label="Amount"
					/>
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
