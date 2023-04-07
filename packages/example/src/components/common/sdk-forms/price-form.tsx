import React, { useState } from "react"
import { Blockchain } from "@rarible/api-client"
import { Grid, MenuItem, Stack } from "@mui/material"
import { FormTextInput } from "../form/form-text-input"
import { UseFormReturn } from "react-hook-form"
import { FormSelect } from "../form/form-select"
import { CurrencyOption } from "../../../common/currency-helpers"
import { ContractAddress, toContractAddress } from "@rarible/types"

interface IPriceFormProps {
	form: UseFormReturn
	currencyOptions?: CurrencyOption[],
  max?: string | number
}

function getCurrencyOptionValue(option: CurrencyOption): string {
	return `${option.blockchain}::${option.type === "TOKEN" ? option.type + "::" + option.contract : option.type}`
}

export function parseCurrencyType(value: string): {
	blockchain: Blockchain,
	type: CurrencyOption["type"],
	contract: ContractAddress | undefined,
} {
	const [blockchain,type, contract] = value.split("::")
	return {
		blockchain: blockchain as Blockchain,
		type: type as CurrencyOption["type"],
		contract: contract ? toContractAddress(contract) : undefined
	}
}

function getCurrencyOptionByValue(value: string, currencyOptions: CurrencyOption[]): CurrencyOption | undefined {
	return currencyOptions.find((option) => getCurrencyOptionValue(option) === value)
}

export function PriceForm(props: IPriceFormProps) {
	const { form, currencyOptions: currencyOptionsOriginal, max } = props
  const currencyOptions = currencyOptionsOriginal || []
  const isEmptyCurrency = currencyOptions !== undefined
	const [currencyType, setCurrencyType] = useState(getCurrencyOptionValue(currencyOptions[0]))
	const selectedOption = getCurrencyOptionByValue(currencyType, currencyOptions)

	return <Stack spacing={2}>
		<Grid container spacing={2}>
			<Grid item xs={8}>
				<FormTextInput
					type="number"
					inputProps={{ min: 0, step: "any", max: max || undefined }}
					form={form}
					options={{
						min: 0,
            max: max || undefined
					}}
					name="price"
					label="Price"
				/>
			</Grid>
      {
        isEmptyCurrency ?
          <Grid item xs={4}>
            <FormSelect
              form={form}
              value={currencyType}
              onChange={(e) => {
                setCurrencyType(e.target.value)
                const selectedOption = getCurrencyOptionByValue(e.target.value, currencyOptions)
                form.setValue("contract", selectedOption?.type === "TOKEN" ? selectedOption.contract ?? "" : "")
              }}
              name="currencyType"
              label="Currency"
            >
              {
                currencyOptions.map((option, index) => {
                  const value = getCurrencyOptionValue(option)
                  return <MenuItem key={value} value={value}>
                    {option.label}
                  </MenuItem>
                })
              }
            </FormSelect>
          </Grid>
          : null
      }
		</Grid>
		{
			selectedOption?.type === "TOKEN" && isEmptyCurrency ?
				<FormTextInput
					type="text"
					form={form}
					defaultValue={selectedOption.contract}
					disabled={selectedOption.contract !== null}
					name="contract"
					label="Contract"
				/>
			: null
		}
	</Stack>
}
