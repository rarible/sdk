import React, { useContext } from "react"
import { Box } from "@mui/material"
import { BlockchainGroup } from "@rarible/api-client"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormStepper } from "../../components/common/form-stepper"
import { RequestResult } from "../../components/common/request-result"
import { BuyBulkPrepareForm } from "./buy-prepare-form"
import { BuyBulkComment } from "./comments/buy-comment"
import { TransactionInfo } from "../../components/common/transaction-info"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { BuyBulkForm } from "./buy-form"

function validateConditions(blockchain: BlockchainGroup | undefined): boolean {
	return !!blockchain
}

export function BuyBulkPage() {
	const connection = useContext(ConnectorContext)
	const blockchain = connection.sdk?.wallet?.blockchain

	return (
		<Page header="Buy Token">
			{
				!validateConditions(blockchain) && (
					<CommentedBlock sx={{ my: 2 }}>
						<UnsupportedBlockchainWarning blockchain={blockchain}/>
					</CommentedBlock>
				)
			}
			<CommentedBlock sx={{ my: 2 }} comment={<BuyBulkComment/>}>
				<FormStepper
					steps={[
						{
							label: "Get Order Info",
							render: (onComplete) => {
								return <BuyBulkPrepareForm
									onComplete={onComplete}
									disabled={!validateConditions(blockchain)}
								/>
							},
						},
						{
							label: "Send Transaction",
							render: (onComplete, lastResponse) => {
								return <BuyBulkForm
									onComplete={onComplete}
									prepare={lastResponse}
									disabled={!validateConditions(blockchain)}
								/>
							},
						},
						{
							label: "Done",
							render: (onComplete, lastResponse) => {
								return <RequestResult
									result={{
										type: "complete",
										data: lastResponse,
									}}
									completeRender={(data) =>
										<Box sx={{ my: 2 }}>
											<TransactionInfo transaction={data}/>
										</Box>
									}
								/>
							},
						},
					]}
				/>
			</CommentedBlock>
		</Page>
	)
}
