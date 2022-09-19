import React from "react"
import type { Order } from "@rarible/api-client"
import { FormTextInput } from "../form/form-text-input"
import { PrepareFillResponse } from "@rarible/sdk/build/types/order/fill/domain"
import { UseFormReturn } from "react-hook-form"

interface IFillRequestFormProps {
	prepare: PrepareFillResponse
	order: Order
	form: UseFormReturn
	namePrefix?: string
}

export function FillRequestForm(props: IFillRequestFormProps) {
	const { prepare, form, namePrefix } = props
	return <>
		<FormTextInput
			type="number"
			inputProps={{
				min: 1,
				max: prepare.maxAmount,
				step: 1,
			}}
			form={form}
			options={{
				min: 1,
				max: Number(prepare.maxAmount),
			}}
			name={(namePrefix ? namePrefix + "_" : "") + "amount"}
			label="Amount"
		/>
		{
			renderItemSelector(props)
		}
	</>
}

function renderItemSelector({ form, order, namePrefix }: IFillRequestFormProps) {
	if (order.make.type["@type"] === "AMM_NFT") {
		return <FormTextInput
			type="text"
			form={form}
			name={(namePrefix ? namePrefix + "_" : "") + "itemId"}
			label="Item Id"
		/>
	}
	return undefined
}