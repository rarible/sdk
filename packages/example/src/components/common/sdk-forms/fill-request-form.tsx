import React, { useState } from "react"
import type { Order } from "@rarible/api-client"
import { Stack } from "@mui/material"
import type { PreparedFillInfo } from "@rarible/sdk/build/types/order/fill/domain"
import type { UseFormReturn } from "react-hook-form"
import { FormTextInput } from "../form/form-text-input"

interface IFillRequestFormProps {
  prepare: PreparedFillInfo
  order: Order | undefined
  form: UseFormReturn
  isFillBatch?: boolean
  namePrefix?: string
  key?: string | number
}

export function FillRequestForm(props: IFillRequestFormProps) {
  const { prepare, form, namePrefix, isFillBatch } = props
  const [itemsCount, setItemsCount] = useState(1)
  return (
    <Stack spacing={2}>
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
    </Stack>
  )
}

function getFieldNameWithPrefix(prefix: string | undefined, field: string): string {
  return (prefix ? prefix + "_" : "") + field
}
