import { useEffect, useState } from "react"
import { WalletType } from "@rarible/sdk-wallet"
import { Box, Grid, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import { useRequestResult } from "../../../components/hooks/use-request-result"
import { FormSubmit } from "../../../components/common/form/form-submit"
import { RequestResult } from "../../../components/common/request-result"
import { TransactionInfo } from "../../../components/common/transaction-info"
import { useSdkContext } from "../../../components/connector/sdk"

export function SetupMattelCollections() {
	const { result, isFetching, setError, setComplete } = useRequestResult()
	const connection = useSdkContext()
	const [collectionsState, setCollections] = useState("")
	const blockchain = connection.sdk.wallet?.walletType
	const isFlowActive = blockchain === WalletType.FLOW
	const form = useForm()

	function getCollectionsStatus() {
		if (connection?.sdk?.flow) {
			connection.sdk.flow.checkInitMattelCollections()
				.then(status => setCollections(JSON.stringify(status, null, " ")))
				.catch(console.error)
		}
	}
	useEffect(() => {
		getCollectionsStatus()
	}, [])

	return (
		<div style={{ marginTop: 20 }}>
			<form onSubmit={form.handleSubmit(async () => {
				try {
					const tx = await connection?.sdk?.flow?.setupMattelCollections()
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
					<Box sx={{ my: 2 }}>
						<TransactionInfo transaction={data}/>
					</Box>
				}
			/>

		</div>
	)
}
