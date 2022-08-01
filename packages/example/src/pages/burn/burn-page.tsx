import React, { useContext } from "react"
import { Box } from "@mui/material"
import { useParams } from "react-router-dom"
import { WalletType } from "@rarible/sdk-wallet"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormStepper } from "../../components/common/form-stepper"
import { RequestResult } from "../../components/common/request-result"
import { BurnForm } from "./burn-form"
import { TransactionInfo } from "../../components/common/transaction-info"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { BurnComment } from "./comments/burn-comment"
import { BurnPrepareForm } from "./burn-prepare-form"

function validateConditions(blockchain: WalletType | undefined): boolean {
	return !!blockchain
}

export function BurnPage() {
	const params = useParams()
	const connection = useContext(ConnectorContext)
	const blockchain = connection.sdk?.wallet?.walletType

	return (
		<Page header="Burn Token">
			{
				!validateConditions(blockchain) && (
					<CommentedBlock sx={{ my: 2 }}>
						<UnsupportedBlockchainWarning blockchain={blockchain}/>
					</CommentedBlock>
				)
			}
			<CommentedBlock sx={{ my: 2 }} comment={<BurnComment/>}>
				<FormStepper
					steps={[
						{
							label: "Get Item Info",
							render: (onComplete) => {
								return <BurnPrepareForm
									onComplete={onComplete}
									disabled={!validateConditions(blockchain)}
									itemId={params.itemId}
								/>
							}
						},
						{
							label: "Send Transaction",
							render: (onComplete, lastResponse) => {
								return <BurnForm
									onComplete={onComplete}
									prepare={lastResponse}
									disabled={!validateConditions(blockchain)}
								/>
							}
						},
						{
							label: "Done",
							render: (onComplete, lastResponse) => {
								return <RequestResult
									result={{ type: "complete", data: lastResponse }}
									completeRender={(data) =>
										<Box sx={{ my: 2 }}>
											<TransactionInfo transaction={data}/>
										</Box>
									}
								/>
							}
						}
					]}
				/>
			</CommentedBlock>
		</Page>
	)
}
