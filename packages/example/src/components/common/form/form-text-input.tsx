import React from "react"
import { useForm } from "react-hook-form"
import { TextField } from "@mui/material"
import { RegisterOptions } from "react-hook-form/dist/types/validator"
import { StandardTextFieldProps } from "@mui/material/TextField/TextField"
import { useFormInputError } from "./form-hooks"

interface IFormTextInputProps extends StandardTextFieldProps {
	form: ReturnType<typeof useForm>
	options?: RegisterOptions<any, any>
	name: string
}

export function FormTextInput({ form, options, name, label, helperText, disabled, ...rest }: IFormTextInputProps) {
	const { register } = form
	const { hasError, message: errorMessage } = useFormInputError(form, name)

	return <TextField
		label={label}
		size="small"
		error={hasError}
		helperText={errorMessage ?? helperText}
		fullWidth
		{...rest}
		{...register(name, { required: true, disabled, ...options })}
	/>
}