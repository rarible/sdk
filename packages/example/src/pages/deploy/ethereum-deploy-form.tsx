import React from "react"
import { MenuItem, Stack } from "@mui/material"
import { useForm } from "react-hook-form"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormCheckbox } from "../../components/common/form/form-checkbox"
import { FormSelect } from "../../components/common/form/form-select"

interface IEthereumDeployFormProps {
	form: ReturnType<typeof useForm>
}

export function EthereumDeployForm({ form }: IEthereumDeployFormProps) {
	return (
		<>
			<Stack spacing={2}>
				<FormSelect
					form={form}
					defaultValue={"ERC721"}
					name="contract"
					label="Contract Type"
				>
					<MenuItem value={"ERC721"}>{"ERC721"}</MenuItem>
					<MenuItem value={"ERC1155"}>{"ERC1155"}</MenuItem>
				</FormSelect>
				<FormTextInput form={form} name="name" label="Name"/>
				<FormTextInput form={form} name="symbol" label="Symbol"/>
				<FormTextInput form={form} name="baseURI" label="Base URI"/>
				<FormTextInput form={form} name="contractURI" label="Contract URI"/>
				<FormCheckbox form={form} name="private" label="Private Collection"/>
			</Stack>
		</>
	)
}
