import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import { Box, Stack } from "@mui/material"
import type { PrepareOrderResponse } from "@rarible/sdk/build/types/order/common"
import { MaxFeesBasePointSupport } from "@rarible/sdk/build/types/order/fill/domain"
import { toBigNumber } from "@rarible/types"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import { getCurrency, getCurrencyOptions } from "../../common/currency-helpers"
import { parseCurrencyType, PriceForm } from "../../components/common/sdk-forms/price-form"
import { EnvironmentContext } from "../../components/connector/environment-selector-provider"

interface ISellFormProps {
	onComplete: (response: any) => void
	prepare: PrepareOrderResponse
	disabled?: boolean
}

export function SellForm({ prepare, disabled, onComplete }: ISellFormProps) {
	const { environment } = useContext(EnvironmentContext)
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
					const currency = parseCurrencyType(formData.currencyType)

					onComplete(await prepare.submit({
						price: toBigNumber(formData.price),
						amount: parseInt(formData.amount),
						currency: getCurrency(currency.blockchain, currency.type, currency.contract ?? formData.contract),
						maxFeesBasePoint,
						originFees: [],
					}))
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					<PriceForm
						form={form}
						currencyOptions={getCurrencyOptions(prepare.supportedCurrencies, environment)}
					/>
					<FormTextInput
						type="number"
						inputProps={{ min: 1, max: prepare.maxAmount, step: 1 }}
						form={form}
						options={{
							min: 1,
							max: Number(prepare.maxAmount),
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
