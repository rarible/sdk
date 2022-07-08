import React, { useContext } from "react"
import { Box, Stack } from "@mui/material"
import { useForm } from "react-hook-form"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import { PrepareFillBatchResponse } from "@rarible/sdk/build/types/order/fill/domain"
import { toOrderId } from "@rarible/types"
import { faCheck, faCheckDouble, faChevronRight, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"
import { LoadingButton } from "@mui/lab"
import { Icon } from "../../components/common/icon"
import { size } from "lodash"

interface IBuyBatchFormProps {
	disabled?: boolean
	onComplete: (response: PrepareFillBatchResponse) => void
	orders: ReturnType<typeof toOrderId>[]
	addToBatch: (orderId: ReturnType<typeof toOrderId>) => void
}

export function BuyBatchForm({
																			disabled,
																			onComplete,
																			orders,
																			addToBatch,
																		}: IBuyBatchFormProps) {
	const connection = useContext(ConnectorContext)
	const form = useForm()
	const { handleSubmit } = form
	const { result, setError, reset } = useRequestResult()
	const state = resultToState(result.type)
	const { formState: { errors, isSubmitting, isValidating } } = form
	const isValid = size(errors) === 0
	let color
	let iconEl
	if (!isValid) {
		color = "warning"
		iconEl = <Icon icon={faExclamationTriangle}/>
	} else {
		switch (state) {
			case "error":
				color = "error"
				iconEl = <Icon icon={faExclamationTriangle}/>
				break
			case "success":
				color = "success"
				iconEl = <Icon icon={faCheckDouble}/>
				break
			case "normal":
			default:
				color = "primary"
				iconEl = <Icon icon={faCheck}/>
		}
	}
	return (
		<Stack spacing={2}>
			<form onSubmit={handleSubmit(async (formData) => {
				if (!connection.sdk) {
					return
				}
				try {
					onComplete(await connection.sdk.order.buyBatch([{
						orderId: toOrderId(formData.orderId)
					}]))
				} catch (e) {
					setError(e)
				}
			})}>
				<Stack spacing={2}>
					<FormTextInput form={form} name="orderId" label="Order ID" required={true} disabled={false}/>
					<Box>
						<LoadingButton
							loading={isSubmitting || isValidating}
							loadingPosition="start"
							startIcon={iconEl}
							color={color as any}
							variant="contained"
							disabled={disabled}
							onClick={async () => {
								reset()
								try {
									const orderId = toOrderId(form.getValues("orderId"))
									addToBatch(orderId)
								} catch (e) {
									setError(e)
								}
							}}
						>
							Add to batch
						</LoadingButton>
					</Box>
					<Box>
						<FormSubmit
							form={form}
							label="Next"
							state={resultToState(result.type)}
							icon={faChevronRight}
							disabled={!orders.length}
						/>
					</Box>
				</Stack>
			</form>
			<Box sx={{ my: 2 }}>
				<RequestResult result={result}/>
			</Box>
		</Stack>
	)
}
