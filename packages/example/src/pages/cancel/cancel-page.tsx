import React, { useContext } from "react"
import { Box } from "@mui/material"
import { WalletType } from "@rarible/sdk-wallet"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormStepper } from "../../components/common/form-stepper"
import { RequestResult } from "../../components/common/request-result"
import { CancelForm } from "./cancel-form"
import { CancelComment } from "./comments/cancel-comment"
import { TransactionInfo } from "../../components/common/transaction-info"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"

function validateConditions(blockchain: WalletType | undefined): boolean {
	return !!blockchain
}

export function CancelPage() {
	//const params = useParams()
	const connection = useContext(ConnectorContext)
	const blockchain = connection.sdk?.wallet?.walletType

	return (
		<Page header="Cancel Order">
			{
				!validateConditions(blockchain) && (
					<CommentedBlock sx={{ my: 2 }}>
						<UnsupportedBlockchainWarning blockchain={blockchain}/>
					</CommentedBlock>
				)
			}
			<CommentedBlock sx={{ my: 2 }} comment={<CancelComment/>}>
				<FormStepper
					steps={[
						{
							label: "Send Transaction",
							render: (onComplete) => {
								return <CancelForm
									onComplete={onComplete}
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
