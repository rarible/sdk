import React, { useContext } from "react";
import { Page } from "../../components/page"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider";
import { WalletType } from "@rarible/sdk-wallet";
import { Box, Grid, Typography } from "@mui/material";
import { TransactionInfo } from "../../components/common/transaction-info";
import { RequestResult } from "../../components/common/request-result";
import { useRequestResult } from "../../components/hooks/use-request-result";
import { useForm } from "react-hook-form"
import { FormTextInput } from "../../components/common/form/form-text-input";
import { FormSubmit } from "../../components/common/form/form-submit";
import { EnvironmentContext } from "../../components/connector/environment-selector-provider";
import { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain";

export function UtilsPage() {
	const connection = useContext(ConnectorContext)
	const blockchain = connection.sdk?.wallet?.walletType
	const isFlowActive = blockchain === WalletType.FLOW

	return (
		<Page header="Utils page">
			{
				isFlowActive && <FlowUtils/>
			}
		</Page>
		)

}

function getDefaultCollection(env: RaribleSdkEnvironment) {
	switch (env) {
		case "testnet": return "FLOW:A.80102bce1de42dc4.HWGaragePackV2"
		default: return "FLOW:"
	}
}
export function FlowUtils() {
	const { environment: env } = useContext(EnvironmentContext)
	const { result, isFetching, setError, setComplete } = useRequestResult()
	const connection = useContext(ConnectorContext)
	const blockchain = connection.sdk?.wallet?.walletType
	const isFlowActive = blockchain === WalletType.FLOW
	const form = useForm()
	const { handleSubmit } = form

	return (
		<>
			<form onSubmit={handleSubmit(async (formData) => {
				try {
					const tx = await connection?.sdk?.flow?.setupAccount(form.getValues("collection"))
					setComplete(tx)
				} catch (e) {
					setError(e)
				}
			})}>

				<Typography sx={{my: 2}} variant="h6" component="h2" gutterBottom>
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
