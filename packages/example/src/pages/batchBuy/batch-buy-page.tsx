import React, { useContext } from "react"
import { Box } from "@mui/material"
import { WalletType } from "@rarible/sdk-wallet"
import { useParams } from "react-router-dom"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormStepper } from "../../components/common/form-stepper"
import { RequestResult } from "../../components/common/request-result"
import { BatchBuyPrepareForm } from "./batch-buy-prepare-form"
import { BatchBuyForm } from "./batch-buy-form"
import { BatchBuyComment } from "./comments/batch-buy-comment"
import { TransactionInfo } from "../../components/common/transaction-info"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"

function validateConditions(blockchain: WalletType | undefined): boolean {
	return !!blockchain && [WalletType.ETHEREUM, WalletType.TEZOS].includes(blockchain)
}

export function BatchBuyPage() {
	const params = useParams()
	const connection = useContext(ConnectorContext)
	const blockchain = connection.sdk?.wallet?.walletType

	return (
		<Page header="Batch Buy Tokens">
			{
				!validateConditions(blockchain) && (
					<CommentedBlock sx={{ my: 2 }}>
						<UnsupportedBlockchainWarning blockchain={blockchain}/>
					</CommentedBlock>
				)
			}
			<CommentedBlock sx={{ my: 2 }} comment={<BatchBuyComment/>}>
				<FormStepper
					steps={[
						{
							label: "Get Order Info",
							render: (onComplete) => {
								return <BatchBuyPrepareForm
									onComplete={onComplete}
									disabled={!validateConditions(blockchain)}
									orderId={params.orderId}
								/>
							}
						},
						{
							label: "Send Transaction",
							render: (onComplete, lastResponse) => {
								return <BatchBuyForm
									onComplete={onComplete}
									prepare={lastResponse.prepare}
									orders={lastResponse.orders}
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
