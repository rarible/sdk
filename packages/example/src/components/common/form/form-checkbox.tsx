import React from "react"
import type { useForm } from "react-hook-form"
import { Checkbox, FormControlLabel } from "@mui/material"
import type { RegisterOptions } from "react-hook-form/dist/types/validator"
import type { FormControlLabelProps } from "@mui/material/FormControlLabel/FormControlLabel"

interface IFormCheckboxProps extends Omit<FormControlLabelProps, "control" | "form">  {
	form: ReturnType<typeof useForm>
	options?: RegisterOptions<any, any>
	name: string
}

export function FormCheckbox({ form, name, options, ...rest }: React.PropsWithChildren<IFormCheckboxProps>) {
	const { register } = form

	return <FormControlLabel
		control={<Checkbox {...register(name, { ...options })} />}
		{...rest}
	/>
}