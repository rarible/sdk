import React, { useContext } from "react"
import { Box } from "@mui/material"
import { Blockchain } from "@rarible/api-client"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormStepper } from "../../components/common/form-stepper"
import { RequestResult } from "../../components/common/request-result"
import { AcceptBidPrepareForm } from "./acceptbid-prepare-form"
import { AcceptBidForm } from "./acceptbid-form"
import { AcceptBidComment } from "./comments/accepbid-comment"
import { TransactionInfo } from "../../components/common/transaction-info"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"

function validateConditions(blockchain: Blockchain | undefined): boolean {
	return !!blockchain
}

export function AcceptBidPage() {
	const connection = useContext(ConnectorContext)
	const blockchain = connection.sdk?.wallet?.blockchain

	return (
		<Page header="Accept Bid">
			{
				!validateConditions(blockchain) && <CommentedBlock sx={{ my: 2 }}>
                    <UnsupportedBlockchainWarning blockchain={blockchain}/>
                </CommentedBlock>
			}
			<CommentedBlock sx={{ my: 2 }} comment={<AcceptBidComment/>}>
				<FormStepper
					steps={[
						{
							label: "Get Order Info",
							render: (onComplete) => {
								return <AcceptBidPrepareForm
									onComplete={onComplete}
									disabled={!validateConditions(blockchain)}
								/>
							}
						},
						{
							label: "Send Transaction",
							render: (onComplete, lastResponse) => {
								return <AcceptBidForm
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
