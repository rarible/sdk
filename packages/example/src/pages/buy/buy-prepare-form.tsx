import type { Order } from "@rarible/api-client"
import { Box, Stack } from "@mui/material"
import { useForm } from "react-hook-form"
import type { PrepareFillResponse } from "@rarible/sdk/build/types/order/fill/domain"
import { toOrderId } from "@rarible/types"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from "react-router-dom"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { RequestResult } from "../../components/common/request-result"
import { useSdkContext } from "../../components/connector/sdk"

interface IBuyPrepareFormProps {
  disabled?: boolean
  onComplete: (response: { prepare: PrepareFillResponse; order: Order }) => void
  orderId: string | undefined
}

export function BuyPrepareForm({ orderId, disabled, onComplete }: IBuyPrepareFormProps) {
  const navigate = useNavigate()
  const connection = useSdkContext()
  const form = useForm()
  const { result, setError } = useRequestResult()

  return (
    <>
      <form
        onSubmit={form.handleSubmit(async formData => {
          try {
            const orderId = toOrderId(formData.orderId)
            onComplete({
              prepare: await connection.sdk.order.buy.prepare({
                orderId,
              }),
              order: await connection.sdk.apis.order.getOrderById({ id: orderId }),
            })
            navigate(`/buy/${formData.orderId}`, {})
          } catch (e) {
            setError(e)
          }
        })}
      >
        <Stack spacing={2}>
          <FormTextInput form={form} defaultValue={orderId} name="orderId" label="Order ID" />
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
