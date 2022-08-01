import React, { useContext } from "react"
import { useParams } from "react-router-dom"
import { Box, Typography } from "@mui/material"
import { WalletType } from "@rarible/sdk-wallet"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormStepper } from "../../components/common/form-stepper"
import { RequestResult } from "../../components/common/request-result"
import { InlineCode } from "../../components/common/inline-code"
import { CopyToClipboard } from "../../components/common/copy-to-clipboard"
import { SellPrepareForm } from "./sell-prepare-form"
import { SellForm } from "./sell-form"
import { SellComment } from "./comments/sell-comment"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"

function validateConditions(blockchain: WalletType | undefined): boolean {
	return !!blockchain
}

export function SellPage() {
	const params = useParams()
	const connection = useContext(ConnectorContext)
	const blockchain = connection.sdk?.wallet?.walletType

	return (
		<Page header="Sell Token">
			{
				!validateConditions(blockchain) && (
					<CommentedBlock sx={{ my: 2 }}>
						<UnsupportedBlockchainWarning blockchain={blockchain}/>
					</CommentedBlock>
				)
			}
			<CommentedBlock sx={{ my: 2 }} comment={<SellComment/>}>
				<FormStepper
					steps={[
						{
							label: "Get Item Info",
							render: (onComplete) => {
								return <SellPrepareForm
									onComplete={onComplete}
									disabled={!validateConditions(blockchain)}
									itemId={params.itemId}
								/>
							}
						},
						{
							label: "Send Transaction",
							render: (onComplete, lastResponse) => {
								return <SellForm
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
