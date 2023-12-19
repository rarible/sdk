import React, { useEffect, useState } from "react"
import { WalletType } from "@rarible/sdk-wallet"
import { Box, Grid, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import { useRequestResult } from "../../../components/hooks/use-request-result"
import { useSdk } from "../../../components/connector/sdk-connection-provider"
import { FormSubmit } from "../../../components/common/form/form-submit"
import { RequestResult } from "../../../components/common/request-result"
import { TransactionInfo } from "../../../components/common/transaction-info"

export function SetupMattelCollections() {
	const { result, isFetching, setError, setComplete } = useRequestResult()
	const sdk = useSdk()
	const [collectionsState, setCollections] = useState("")

	const blockchain = sdk?.wallet?.walletType
	const isFlowActive = blockchain === WalletType.FLOW
	const form = useForm()
	const { handleSubmit } = form
	function getCollectionsStatus() {
		if (sdk?.flow) {
			sdk.flow.checkInitMattelCollections()
				.then(status => setCollections(JSON.stringify(status, null, " ")))
				.catch(console.error)
		}
	}
	useEffect(() => {
		getCollectionsStatus()
	}, [])
	return (
		<div style={{ marginTop: 20 }}>

			<form onSubmit={handleSubmit(async () => {
				try {
					const tx = await sdk?.flow?.setupMattelCollections()
					setComplete(tx)
					getCollectionsStatus()
				} catch (e) {
					setError(e)
				}
			})}>

				<Typography sx={{ my: 2 }} variant="h6" component="h2" gutterBottom>
          Setup Mattel collections
				</Typography>
				<Grid container spacing={2}>

					<Grid item xs={4}>
						{
							collectionsState ? <div>Collection state: <pre>{collectionsState}</pre></div> : null
						}
					</Grid>
				</Grid>
				<Grid item xs={2}>
					<FormSubmit
						form={form}
						label="Setup"
						state={isFetching ? "normal": "success"}
						disabled={isFetching || !isFlowActive}
					/>
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

		</div>
	)
}
