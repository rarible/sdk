import { useForm } from "react-hook-form"
import { Box, Grid, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { RequestResult } from "../../components/common/request-result"
import { useRequestResult } from "../../components/hooks/use-request-result"
import { useApiKeyContext } from "../../components/connector/api-key"

export function APIKeyForm() {
  const form = useForm()
  const { result, setError, setComplete } = useRequestResult()
  const { prodApiKey, testnetApiKey, setProdApiKey, setTestnetApiKey } = useApiKeyContext()

  return (
    <>
      <Accordion style={{ marginTop: 50 }}>
        <AccordionSummary aria-controls="panel1-content" id="panel1-header">
          <Typography>API Keys</Typography>
        </AccordionSummary>
        <AccordionDetails>
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
                    defaultValue={prodApiKey}
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
                    defaultValue={testnetApiKey}
                    name="api-key-testnet"
                    label="API Key Testnet"
                  />
                </Box>
              </Grid>
            </Grid>
            <Grid item xs={2}>
              <Box sx={{ my: 2 }}>
                <FormSubmit form={form} label="Setup" state={"success"} />
              </Box>
            </Grid>
          </form>
          <RequestResult result={result} completeRender={data => <Box sx={{ my: 2 }}>{data}</Box>} />
        </AccordionDetails>
      </Accordion>
    </>
  )
}
