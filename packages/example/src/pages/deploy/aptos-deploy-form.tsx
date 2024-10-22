import { Stack } from "@mui/material"
import type { useForm } from "react-hook-form"
import { FormTextInput } from "../../components/common/form/form-text-input"

interface IAptosDeployFormProps {
  form: ReturnType<typeof useForm>
}

export function AptosDeployForm({ form }: IAptosDeployFormProps) {
  return (
    <>
      <Stack spacing={2}>
        <FormTextInput form={form} name="name" label="Name" />
        <FormTextInput form={form} name="description" label="Description" defaultValue={""} />
        <FormTextInput
          form={form}
          name="uri"
          label="Uri"
          defaultValue={"ipfs://QmWYpMyoaUGNRSQbwhw97xM8tcRWm4Et598qtzmzsau7ch"}
        />
      </Stack>
    </>
  )
}
