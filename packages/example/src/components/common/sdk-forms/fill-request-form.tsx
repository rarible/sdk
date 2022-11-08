import React, { useState } from "react"
import type { Order } from "@rarible/api-client"
import { Box, IconButton, Stack } from "@mui/material"
import type { PreparedFillInfo } from "@rarible/sdk/build/types/order/fill/domain"
import { FormTextInput } from "../form/form-text-input"
import { UseFormReturn } from "react-hook-form"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

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
      isFillBatch && isAmmOrder(props.order) ?
        <>
          {
            (
              (new Array(itemsCount))
                .fill(0)
                .map((v, i) => renderItemSelector({...props, key: i}))
            )
          }
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="flex-end"
          >
            <IconButton
              color="primary"
              onClick={() => {
                form.setValue(`${namePrefix}_itemsCounter`, itemsCount + 1)
                setItemsCount(itemsCount + 1)
              }}
            >
              <AddCircleOutlineIcon/>
            </IconButton>
            <IconButton
              color="error"
              disabled={itemsCount <= 1}
              onClick={() => {
                form.setValue(`${namePrefix}_itemsCounter`, itemsCount - 1)
                setItemsCount(Math.max(1, itemsCount - 1))
              }}
            >
              <RemoveCircleOutlineIcon/>
            </IconButton>
          </Box>
        </>
        : renderItemSelector({...props})
    }
	</Stack>
}

function renderItemSelector({ form, order, namePrefix, key, isFillBatch }: IFillRequestFormProps) {
  let fieldName = getFieldNameWithPrefix(namePrefix, "itemId")
  if (isFillBatch) {
    fieldName = fieldName + "_" + key
  }
  if (isAmmOrder(order)) {
		return <FormTextInput
			type="text"
      key={key}
			form={form}
			name={fieldName}
			label="Item Id"
		/>
	}
	return undefined
}


function getFieldNameWithPrefix(prefix: string | undefined, field: string): string {
	return (prefix ? prefix + "_" : "") + field
}

function isAmmOrder(order: Order | undefined): boolean {
  return order?.make.type["@type"] === "AMM_NFT"
}
