import React from "react"
import { Stack } from "@mui/material"
import { useForm } from "react-hook-form"
import { FormTextInput } from "../../components/common/form/form-text-input"

interface ISolanaDeployFormProps {
	form: ReturnType<typeof useForm>
}

export function SolanaDeployForm({ form }: ISolanaDeployFormProps) {
	return (
		<>
			<Stack spacing={2}>
				<FormTextInput form={form} name="metadataURI" label="Metadata URI"/>
			</Stack>
		</>
	)
}
