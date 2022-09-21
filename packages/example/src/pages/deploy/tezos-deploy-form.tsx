import React from "react"
import { MenuItem, Stack } from "@mui/material"
import { useForm } from "react-hook-form"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormCheckbox } from "../../components/common/form/form-checkbox"
import { FormSelect } from "../../components/common/form/form-select"

interface ITezosDeployFormProps {
	form: ReturnType<typeof useForm>
}

export function TezosDeployForm({ form }: ITezosDeployFormProps) {
	return (
		<>
			<Stack spacing={2}>
				<FormSelect
					form={form}
					defaultValue={"NFT"}
					name="collection"
					label="Collection Type"
				>
					<MenuItem value={"NFT"}>{"NFT"}</MenuItem>
					<MenuItem value={"MT"}>{"MT"}</MenuItem>
				</FormSelect>
				<FormTextInput form={form} name="metadataURI" label="Metadata URI"/>
				<FormCheckbox form={form} name="private" label="Private Collection"/>
			</Stack>
		</>
	)
}
