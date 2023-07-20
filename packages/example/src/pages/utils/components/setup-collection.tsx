import React, { useContext } from "react"
import { WalletType } from "@rarible/sdk-wallet"
import { Box, Grid, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import { EnvironmentContext } from "../../../components/connector/environment-selector-provider"
import { useRequestResult } from "../../../components/hooks/use-request-result"
import { ConnectorContext } from "../../../components/connector/sdk-connection-provider"
import { FormTextInput } from "../../../components/common/form/form-text-input"
import { FormSubmit } from "../../../components/common/form/form-submit"
import { RequestResult } from "../../../components/common/request-result"
import { TransactionInfo } from "../../../components/common/transaction-info"

export function SetupCollection() {
	const { environment: env } = useContext(EnvironmentContext)
	const { result, isFetching, setError, setComplete } = useRequestResult()
	const connection = useContext(ConnectorContext)

	const blockchain = connection.sdk?.wallet?.walletType
	const isFlowActive = blockchain === WalletType.FLOW
	const form = useForm()
	const { handleSubmit } = form

	return (
		<>
			<form onSubmit={handleSubmit(async () => {
				try {
					const tx = await connection?.sdk?.flow?.setupAccount(form.getValues("collection"))
					setComplete(tx)
				} catch (e) {
					setError(e)
				}
			})}>

				<Typography sx={{ my: 2 }} variant="h6" component="h2" gutterBottom>
          Setup Flow collection
				</Typography>
				<Grid container spacing={2}>

					<Grid item xs={4}>
						<FormTextInput
							type="text"
							form={form}
							defaultValue={getDefaultCollection(env)}
							name="collection"
							label="Collection"
							disabled={!isFlowActive}
						/>
					</Grid>
					<Grid item xs={2}>
						<FormSubmit
							form={form}
							label="Setup"
							state={isFetching ? "normal": "success"}
							disabled={isFetching || !isFlowActive}
						/>
					</Grid>
				</Grid>
			</form>

			<RequestResult
				result={result}
				completeRender={(data) =>
					<>
						<Box sx={{ my: 2 }}>
							<TransactionInfo transaction={data}/>
						</Box>
					</>
				}
			/>

		</>
	)
}

function getDefaultCollection(env: RaribleSdkEnvironment) {
	switch (env) {
		case "testnet": return "FLOW:A.80102bce1de42dc4.HWGaragePackV2"
		default: return "FLOW:"
	}
}
