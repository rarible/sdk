import { useForm } from "react-hook-form"
import type { Order } from "@rarible/api-client"
import { Box, Stack } from "@mui/material"
import type { PrepareFillResponse } from "@rarible/sdk/build/types/order/fill/domain"
import { toItemId } from "@rarible/types/build/item-id"
import { toUnionAddress } from "@rarible/types"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { RequestResult } from "../../components/common/request-result"
import { FillRequestForm } from "../../components/common/sdk-forms/fill-request-form"

interface IBuyFormProps {
  prepare: PrepareFillResponse
  order: Order
  disabled?: boolean
  onComplete: (response: any) => void
}

export function BuyForm({ prepare, order, disabled, onComplete }: IBuyFormProps) {
  const form = useForm()
  const { result, setError } = useRequestResult()

  return (
    <>
      <form
        onSubmit={form.handleSubmit(async formData => {
          try {
            onComplete(
              await prepare.submit({
                amount: parseInt(formData.amount),
                itemId: formData.itemId ? toItemId(formData.itemId) : undefined,
                originFees: [
                  {
                    account: toUnionAddress("ETHEREUM:0xC072c9889dE7206c1C18B9d9973B06B8646FC6bd"),
                    value: 100,
                  },
                ],
              }),
            )
          } catch (e) {
            setError(e)
          }
        })}
      >
        <Stack spacing={2}>
          <FillRequestForm form={form} prepare={prepare} order={order} />
          <Box>
            <FormSubmit form={form} label="Submit" state={resultToState(result.type)} disabled={disabled} />
          </Box>
        </Stack>
      </form>
      <Box sx={{ my: 2 }}>
        <RequestResult result={result} />
      </Box>
    </>
  )
}
