import { Box, Stack } from "@mui/material"
import type { PrepareTransferResponse } from "@rarible/sdk/build/types/nft/transfer/domain"
import { useForm } from "react-hook-form"
import { toItemId } from "@rarible/types"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from "react-router-dom"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { RequestResult } from "../../components/common/request-result"
import { useSdkContext } from "../../components/connector/sdk"

interface ITransferPrepareFormProps {
  disabled?: boolean
  onComplete: (response: PrepareTransferResponse) => void
  itemId: string | undefined
}

export function TransferPrepareForm({ itemId, disabled, onComplete }: ITransferPrepareFormProps) {
  const navigate = useNavigate()
  const connection = useSdkContext()
  const form = useForm()
  const { result, setError } = useRequestResult()

  return (
    <>
      <form
        onSubmit={form.handleSubmit(async formData => {
          try {
            onComplete(
              await connection.sdk.nft.transfer.prepare({
                itemId: toItemId(formData.itemId),
              }),
            )
            navigate(`/transfer/${formData.itemId}`, {})
          } catch (e) {
            setError(e)
          }
        })}
      >
        <Stack spacing={2}>
          <FormTextInput form={form} defaultValue={itemId} name="itemId" label="Item ID" />
          <Box>
            <FormSubmit
              form={form}
              label="Next"
              state={resultToState(result.type)}
              icon={faChevronRight}
              disabled={disabled}
            />
          </Box>
        </Stack>
      </form>
      <Box sx={{ my: 2 }}>
        <RequestResult result={result} />
      </Box>
    </>
  )
}
