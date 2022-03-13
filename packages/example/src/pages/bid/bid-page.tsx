import React, { useContext } from "react"
import { Box, Typography } from "@mui/material"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormStepper } from "../../components/common/form-stepper"
import { RequestResult } from "../../components/common/request-result"
import { InlineCode } from "../../components/common/inline-code"
import { CopyToClipboard } from "../../components/common/copy-to-clipboard"
import { BidPrepareForm } from "./bid-prepare-form"
import { BidForm } from "./bid-form"
import { BidComment } from "./comments/bid-comment"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { Blockchain } from "@rarible/api-client"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"

function validateConditions(blockchain: Blockchain | undefined): boolean {
	return !!blockchain
}

export function BidPage() {
	const connection = useContext(ConnectorContext)
	const blockchain = connection.sdk?.wallet?.blockchain

	return (
		<Page header="Make Bid">
			{
				!validateConditions(blockchain) && <CommentedBlock sx={{ my: 2 }}>
                    <UnsupportedBlockchainWarning blockchain={blockchain}/>
                </CommentedBlock>
			}
			<CommentedBlock sx={{ my: 2 }} comment={<BidComment/>}>
				<FormStepper
					steps={[
						{
							label: "Get Item Info",
							render: (onComplete) => {
								return <BidPrepareForm
									onComplete={onComplete}
									disabled={!validateConditions(blockchain)}
								/>
							}
						},
						{
							label: "Send Transaction",
							render: (onComplete, lastResponse) => {
								return <BidForm
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
										<>
											<Box sx={{ my: 2 }}>
												<Typography variant="overline">Order ID:</Typography>
												<div>
													<InlineCode wrap>{data}</InlineCode> <CopyToClipboard value={data}/>
												</div>
											</Box>
										</>
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
