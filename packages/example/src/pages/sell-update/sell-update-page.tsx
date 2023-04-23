import React, { useContext } from "react"
import { Box, Typography } from "@mui/material"
import { WalletType } from "@rarible/sdk-wallet"
import { useParams } from "react-router-dom"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormStepper } from "../../components/common/form-stepper"
import { RequestResult } from "../../components/common/request-result"
import { SellUpdatePrepareForm } from "./sell-update-prepare-form"
import { SellUpdateForm } from "./sell-update-form"
import { SellUpdateComment } from "./comments/sell-update-comment"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { InlineCode } from "../../components/common/inline-code";
import { CopyToClipboard } from "../../components/common/copy-to-clipboard";

function validateConditions(blockchain: WalletType | undefined): boolean {
	return !!blockchain
}

export function SellUpdatePage() {
	const params = useParams()
	const connection = useContext(ConnectorContext)
	const blockchain = connection.sdk?.wallet?.walletType

	return (
		<Page header="Change Price">
			{
				!validateConditions(blockchain) && (
					<CommentedBlock sx={{ my: 2 }}>
						<UnsupportedBlockchainWarning blockchain={blockchain}/>
					</CommentedBlock>
				)
			}
			<CommentedBlock sx={{ my: 2 }} comment={<SellUpdateComment/>}>
				<FormStepper
					steps={[
						{
							label: "Get Order Info",
							render: (onComplete) => {
								return <SellUpdatePrepareForm
									onComplete={onComplete}
									disabled={!validateConditions(blockchain)}
									orderId={params.orderId}
								/>
							}
						},
						{
							label: "Send Transaction",
							render: (onComplete, lastResponse) => {
								return <SellUpdateForm
									onComplete={onComplete}
									prepare={lastResponse.prepare}
									order={lastResponse.order}
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
                        <Typography variant="overline">Updated order ID:</Typography>
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
