import React, { useContext } from "react"
import { Box, Typography } from "@mui/material"
import { WalletType } from "@rarible/sdk-wallet"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormStepper } from "../../components/common/form-stepper"
import { RequestResult } from "../../components/common/request-result"
import { InlineCode } from "../../components/common/inline-code"
import { CopyToClipboard } from "../../components/common/copy-to-clipboard"
import { MintPrepareForm } from "./mint-prepare-form"
import { MintForm } from "./mint-form"
import { MintComment } from "./comments/mint-comment"
import { TransactionInfo } from "../../components/common/transaction-info"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"

function validateConditions(blockchain: WalletType | undefined): boolean {
	return !!blockchain
}

export function MintPage() {
	const connection = useContext(ConnectorContext)
	const blockchain = connection.sdk?.wallet?.walletType

	return (
		<Page header="Mint Token">
			{
				!validateConditions(blockchain) && (
					<CommentedBlock sx={{ my: 2 }}>
						<UnsupportedBlockchainWarning blockchain={blockchain}/>
					</CommentedBlock>
				)
			}
			<CommentedBlock sx={{ my: 2 }} comment={<MintComment/>}>
				<FormStepper
					steps={[
						{
							label: "Get Collection & Prepare Mint",
							render: (onComplete) => {
								return <MintPrepareForm
									onComplete={onComplete}
									disabled={!validateConditions(blockchain)}
								/>
							}
						},
						{
							label: "Send Transaction",
							render: (onComplete, lastResponse) => {
								return <MintForm
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
												<Typography variant="overline">Type:</Typography>
												<div>
													<InlineCode wrap>{data.type}</InlineCode>
												</div>
											</Box>
											<Box sx={{ my: 2 }}>
												<Typography variant="overline">Item ID:</Typography>
												<div>
													<InlineCode wrap>{data.itemId}</InlineCode> <CopyToClipboard value={data.itemId}/>
												</div>
											</Box>
											{
												data.type === "on-chain" &&
                          <Box sx={{ my: 2 }}>
                              <TransactionInfo transaction={data.transaction}/>
                          </Box>
											}
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
