import { Box } from "@mui/material"
import type { WalletType } from "@rarible/sdk-wallet"
import { useParams } from "react-router-dom"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormStepper } from "../../components/common/form-stepper"
import { RequestResult } from "../../components/common/request-result"
import { TransactionInfo } from "../../components/common/transaction-info"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { useSdkContext } from "../../components/connector/sdk"
import { TransferForm } from "./transfer-form"
import { TransferComment } from "./comments/transfer-comment"
import { TransferPrepareForm } from "./transfer-prepare-form"

function validateConditions(blockchain: WalletType | undefined): boolean {
	return !!blockchain
}

export function TransferPage() {
	const params = useParams()
	const connection = useSdkContext()
	const blockchain = connection.sdk.wallet?.walletType

	return (
		<Page header="Transfer Token">
			{
				!validateConditions(blockchain) && (
					<CommentedBlock sx={{ my: 2 }}>
						<UnsupportedBlockchainWarning blockchain={blockchain}/>
					</CommentedBlock>
				)
			}
			<CommentedBlock sx={{ my: 2 }} comment={<TransferComment/>}>
				<FormStepper
					steps={[
						{
							label: "Get Item Info",
							render: (onComplete) => {
								return <TransferPrepareForm
									onComplete={onComplete}
									disabled={!validateConditions(blockchain)}
									itemId={params.itemId}
								/>
							},
						},
						{
							label: "Send Transaction",
							render: (onComplete, lastResponse) => {
								return <TransferForm
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
									result={{ type: "complete", data: lastResponse }}
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
