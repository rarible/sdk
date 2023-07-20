import React, { useContext, useState } from "react"
import { WalletType } from "@rarible/sdk-wallet"
import { Box, Button, Grid, TextField, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import { replaceImportAddresses } from "@rarible/flow-sdk/build/common/template-replacer"
import { waitForSeal } from "@rarible/flow-sdk/build/common/transaction"
import { CONFIGS } from "@rarible/flow-sdk/build/config/config"
import type { Fcl } from "@rarible/fcl-types"
import type { AuthWithPrivateKey, FlowNetwork } from "@rarible/flow-sdk/build/types"
import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import { useRequestResult } from "../../../components/hooks/use-request-result"
import { ConnectorContext } from "../../../components/connector/sdk-connection-provider"
import { FormSubmit } from "../../../components/common/form/form-submit"
import { RequestResult } from "../../../components/common/request-result"
import { TransactionInfo } from "../../../components/common/transaction-info"
import { EnvironmentContext } from "../../../components/connector/environment-selector-provider"
export function ExecuteRawTransaction() {
	const { environment: env } = useContext(EnvironmentContext)
	const { result, isFetching, setError, setComplete } = useRequestResult()
	const connection = useContext(ConnectorContext)
	const [code, setCode] = useState("")

	const blockchain = connection.sdk?.wallet?.walletType
	const isFlowActive = blockchain === WalletType.FLOW
	const form = useForm()
	const { handleSubmit } = form

	function updateAddresses() {
		try {
			let flowEnv = getFlowEnv(env)
			const updatedCode = replaceImportAddresses(code, CONFIGS[flowEnv].mainAddressMap)
			setCode(updatedCode)
		} catch (e) {
			console.error(e)
		}
	}
	return (
		<div style={{ marginTop: 20 }}>

			<form onSubmit={handleSubmit(async () => {
				try {
					if (connection.sdk?.wallet?.walletType === WalletType.FLOW) {
						const { fcl, auth } = connection.sdk.wallet
						const txId = await runRawTransaction(
							fcl,
							{
								cadence: code,
								args: fcl.args([]),
							},
							auth
						)
						console.log("tx id=", txId)
						const tx = await waitForSeal(fcl, txId)
						console.log("tx", tx)
					  setComplete(tx)
					}
				} catch (e) {
					setError(e)
				}
			})}>

				<Typography sx={{ my: 2 }} variant="h6" component="h2" gutterBottom>
          Execute raw FLOW transaction
				</Typography>
				<Grid container spacing={2}>

					<Grid item xs={6}>
						<Box sx={{ my: 2 }}>
							<TextField
								fullWidth={true}
								label="Input Text"
								multiline
								value={code}
								onChange={(e) => setCode(e.target.value)}
							/>
						</Box>
						<Button
							variant="outlined"
							component="span"
							onClick={() => updateAddresses()}
						>
              Replace addresses
						</Button>
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

export const runRawTransaction = async (
	fcl: Fcl,
	params: { cadence: string, args?: any },
	signature: AuthWithPrivateKey,
	gasLimit: number = 999,
): Promise<string> => {
	const ix = [fcl.limit(gasLimit)]
	ix.push(
		fcl.payer(signature || fcl.authz),
		fcl.proposer(signature || fcl.authz),
		fcl.authorizations([signature || fcl.authz]),
	)

	if (params.args) {
		ix.push(params.args)
	}
	ix.push(fcl.transaction(params.cadence))
	const tx = await fcl.send(ix)
	return tx.transactionId
}

function getFlowEnv(env: RaribleSdkEnvironment): FlowNetwork {
	switch (env) {
		case "development":
		case "testnet":
		case "staging":
			return "testnet"
		case "prod":
			return "mainnet"
		default: throw new Error("Unrecognized env")
	}
}
