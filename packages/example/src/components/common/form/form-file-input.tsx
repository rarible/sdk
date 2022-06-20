import React from "react"
import { useForm } from "react-hook-form"
import { StandardTextFieldProps } from "@mui/material/TextField/TextField"
import { Button, Input } from "@mui/material"

interface IFormTextInputProps extends StandardTextFieldProps {
	form: ReturnType<typeof useForm>
	name: string
}

export function FormFileInput({ form, name, disabled }: IFormTextInputProps) {
	const { register } = form

	return <>
		<label htmlFor="file-input">
			<Input id="file-input" type="file" {...register(name, { required: true, disabled })} style={{display:"none"}}/>
			<Button variant="outlined" component="span">
				Select file
			</Button>
		</label>
	</>

}
