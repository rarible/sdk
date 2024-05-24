import { MenuItem, Stack } from "@mui/material"
import type { useForm } from "react-hook-form"
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
        <FormSelect form={form} defaultValue={"ERC721"} name="contract" label="Contract Type">
          <MenuItem value={"ERC721"}>{"ERC721"}</MenuItem>
          <MenuItem value={"ERC1155"}>{"ERC1155"}</MenuItem>
        </FormSelect>
        <FormTextInput form={form} name="name" label="Name" defaultValue={DEFAULT_COLLECTION_NAME} />
        <FormTextInput form={form} name="symbol" label="Symbol" defaultValue={DEFAULT_COLLECTION_SYMBOL} />
        <FormTextInput form={form} name="baseURI" label="Base URI" defaultValue={DEFAULT_URI} />
        <FormTextInput form={form} name="contractURI" label="Contract URI" defaultValue={DEFAULT_URI} />
        <FormCheckbox form={form} name="private" label="Private Collection" />
      </Stack>
    </>
  )
}

const DEFAULT_URI = "https://example.com"
const DEFAULT_COLLECTION_NAME = "Rarible Example collection"
const DEFAULT_COLLECTION_SYMBOL = "DFL"
