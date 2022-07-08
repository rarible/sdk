import React, { useContext, useState } from "react"
import { Box } from "@mui/material"
import { BlockchainGroup } from "@rarible/api-client"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormStepper } from "../../components/common/form-stepper"
import { RequestResult } from "../../components/common/request-result"
import { BuyBatchForm } from "./buy-batch-form"
import { BuyBatchComment } from "./comments/buy-comment"
import { TransactionInfo } from "../../components/common/transaction-info"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { BatchOrdersList } from "./orders-list"
import { toOrderId } from "@rarible/types"
import { BuyBatchPrepareForm } from "./buy-batch-prepare-form"

function validateConditions(blockchain: BlockchainGroup | undefined): boolean {
	return !!blockchain
}

export function BuyBatchPage() {
	const connection = useContext(ConnectorContext)
	const blockchain = connection.sdk?.wallet?.blockchain
	const [orders, setOrders] = useState<ReturnType<typeof toOrderId>[]>([])
	const addToBatch = (orderId: ReturnType<typeof toOrderId>) => {
		setOrders([...orders, orderId])
	}
	return (
		<Page header="Buy Token">
			{
				!validateConditions(blockchain) && (
					<CommentedBlock sx={{ my: 2 }}>
						<UnsupportedBlockchainWarning blockchain={blockchain}/>
					</CommentedBlock>
				)
			}
			<BatchOrdersList orders={orders}/>
			<CommentedBlock sx={{ my: 2 }} comment={<BuyBatchComment/>}>
				<FormStepper
					steps={[
						{
							label: "Get Orders Info",
							render: (onComplete) => {
								return <BuyBatchForm
									onComplete={onComplete}
									disabled={!validateConditions(blockchain)}
									addToBatch={addToBatch}
									orders={orders}
								/>
							},
						},
						{
							label: "Send transaction",
							render: (onComplete, lastResponse) => {
								return <BuyBatchPrepareForm
									onComplete={onComplete}
									disabled={!validateConditions(blockchain)}
									prepare={lastResponse}
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
