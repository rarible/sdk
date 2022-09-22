import React from "react"
import type { Order } from "@rarible/api-client"
import { Stack } from "@mui/material"
import type { PreparedFillInfo } from "@rarible/sdk/build/types/order/fill/domain"
import { FormTextInput } from "../form/form-text-input"
import { UseFormReturn } from "react-hook-form"

interface IFillRequestFormProps {
	prepare: PreparedFillInfo
	order: Order | undefined
	form: UseFormReturn
	namePrefix?: string
}

export function FillRequestForm(props: IFillRequestFormProps) {
	const { prepare, form, namePrefix } = props
	return <Stack spacing={2}>
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
			name={getFieldNameWithPrefix(namePrefix, "amount")}
			label="Amount"
		/>
		{
			renderItemSelector(props)
		}
	</Stack>
}

function renderItemSelector({ form, order, namePrefix }: IFillRequestFormProps) {
	if (order?.make.type["@type"] === "AMM_NFT") {
		return <FormTextInput
			type="text"
			form={form}
			name={getFieldNameWithPrefix(namePrefix, "itemId")}
			label="Item Id"
		/>
	}
	return undefined
}


function getFieldNameWithPrefix(prefix: string | undefined, field: string): string {
	return (prefix ? prefix + "_" : "") + field
}
