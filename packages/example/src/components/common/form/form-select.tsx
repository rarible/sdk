import React from "react"
import type { useForm } from "react-hook-form"
import { TextField } from "@mui/material"
import type { RegisterOptions } from "react-hook-form/dist/types/validator"
import type { StandardTextFieldProps } from "@mui/material/TextField/TextField"
import { useFormInputError } from "./form-hooks"

interface IFormSelectProps extends StandardTextFieldProps  {
	form: ReturnType<typeof useForm>
	options?: RegisterOptions<any, any>
	name: string
}

export function FormSelect(
	{ form, options, name, children, helperText, disabled,  ...rest }: React.PropsWithChildren<IFormSelectProps>
) {
	const { register } = form
	const { hasError, message: errorMessage } = useFormInputError(form, name)

	return <TextField
		size="small"
		error={hasError}
		helperText={errorMessage ?? helperText}
		select
		fullWidth
		{...register(name, { required: true, disabled, ...options })}
		{...rest}
	>
		{ children }
	</TextField>
}
