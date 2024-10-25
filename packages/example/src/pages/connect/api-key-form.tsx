import { useForm } from "react-hook-form"
import type { IConnectorStateProvider } from "@rarible/connector"
import { Box, Grid, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useSdkContext } from "../../components/connector/sdk"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { RequestResult } from "../../components/common/request-result"
import { useRequestResult } from "../../components/hooks/use-request-result"
import { useApiKeyContext } from "../../components/connector/api-key"

export function APIKeyForm() {
  const connection = useSdkContext()
  const form = useForm()
  const { result, isFetching, setError, setComplete } = useRequestResult()
  const [apiProd, setApiProd] = useState("")
  const [apiTestnet, setApiTestnet] = useState("")
  const [isFetchingState, setFetchState] = useState(true)
  const { prodApiKey, testnetApiKey, setProdApiKey, setTestnetApiKey } = useApiKeyContext()

  return (
    <>
      <form
        onSubmit={form.handleSubmit(async () => {
          try {
            setProdApiKey(form.getValues("api-key-prod"))
            setTestnetApiKey(form.getValues("api-key-testnet"))
            setComplete("Saved")
          } catch (e) {
            setError(e)
          }
        })}
      >
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box sx={{ my: 2 }}>
              <FormTextInput
                type="text"
                form={form}
                defaultValue={apiProd}
                name="api-key-prod"
                label="API Key Production"
              />
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ my: 2 }}>
              <FormTextInput
                type="text"
                form={form}
                defaultValue={apiTestnet}
                name="api-key-testnet"
                label="API Key Testnet"
              />
            </Box>
          </Grid>
        </Grid>
        <Grid item xs={2}>
          <FormSubmit form={form} label="Setup" state={"success"} />
        </Grid>
      </form>
      <RequestResult result={result} completeRender={data => <Box sx={{ my: 2 }}>{data}</Box>} />
    </>
  )
}
