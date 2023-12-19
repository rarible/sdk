import { WalletType } from "@rarible/sdk-wallet"
import { Box, Grid, TextField, Typography } from "@mui/material"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { useRequestResult } from "../../../components/hooks/use-request-result"
import { useSdk } from "../../../components/connector/sdk-connection-provider"
import { FormSubmit } from "../../../components/common/form/form-submit"
import { RequestResult } from "../../../components/common/request-result"

export function SignTypedDataUtil() {
	const { result, isFetching, setError, setComplete } = useRequestResult()
	const sdk = useSdk()
	const [json, setJson] = useState("")
	const form = useForm()
	const { handleSubmit } = form

	return (
		<div style={{ marginTop: 20 }}>

			<form onSubmit={handleSubmit(async () => {
				try {
					if (sdk?.wallet?.walletType === WalletType.ETHEREUM) {
						const wallet = sdk.wallet
						const jsonObject = JSON.parse(json)
						const signature = await wallet.ethereum.signTypedData(jsonObject)
						setComplete(signature)
					}
				} catch (e) {
					setError(e)
				}
			})}>
				<Typography sx={{ my: 2 }} variant="h6" component="h2" gutterBottom>
          Sign typed data
				</Typography>

				<Grid container spacing={2}>

					<Grid item xs={6}>
						<Box sx={{ my: 2 }}>
							<TextField
								fullWidth={true}
								label="Sign data"
								multiline
								value={json}
								onChange={(e) => setJson(e.target.value)}
							/>
						</Box>
						<FormSubmit
							form={form}
							label="Sign"
							state={isFetching ? "normal": "success"}
							disabled={isFetching}
						/>
					</Grid>

				</Grid>
			</form>

			<div style={{marginTop: 20, maxWidth: 500, wordBreak: "break-all"}}>
				<RequestResult
					result={result}
					completeRender={(data) =>
						<>
							<Box sx={{ my: 2 }}>
                signature: {data}
							</Box>
						</>
					}
				/>
			</div>
		</div>
	)
}
