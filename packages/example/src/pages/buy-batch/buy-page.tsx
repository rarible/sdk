import React, { useContext } from "react"
import { Box } from "@mui/material"
import { BlockchainGroup } from "@rarible/api-client"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormStepper } from "../../components/common/form-stepper"
import { RequestResult } from "../../components/common/request-result"
import { BuyBatchPrepareForm } from "./buy-prepare-form"
import { BuyBatchComment } from "./comments/buy-comment"
import { TransactionInfo } from "../../components/common/transaction-info"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { usePreparedOrders } from "./use-prepared-orders"
import { BatchOrdersList } from "./orders-list"

function validateConditions(blockchain: BlockchainGroup | undefined): boolean {
	return !!blockchain
}

export function BuyBatchPage() {
	const connection = useContext(ConnectorContext)
	const blockchain = connection.sdk?.wallet?.blockchain
	const {
		currentOrder,
		orders,
		preparing,
		error,
		prepareOrder,
		setAmount,
		addToBatch,
	} = usePreparedOrders(connection.sdk)

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
								return <BuyBatchPrepareForm
									onComplete={onComplete}
									disabled={!validateConditions(blockchain)}
									currentOrder={currentOrder}
									prepareOrder={prepareOrder}
									addToBatch={addToBatch}
									orders={orders}
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
