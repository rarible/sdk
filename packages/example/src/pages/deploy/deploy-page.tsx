import React, { useContext } from "react"
import { Box, MenuItem, Stack, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import { Blockchain, BlockchainGroup } from "@rarible/api-client"
import { CreateCollectionBlockchains, CreateCollectionRequest } from "@rarible/sdk/build/types/nft/deploy/domain"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormSubmit } from "../../components/common/form/form-submit"
import { FormSelect } from "../../components/common/form/form-select"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { CollectionDeployComment } from "./comments/collection-deploy-comment"
import { RequestResult } from "../../components/common/request-result"
import { InlineCode } from "../../components/common/inline-code"
import { CollectionResultComment } from "./comments/collection-result-comment"
import { CopyToClipboard } from "../../components/common/copy-to-clipboard"
import { TransactionInfo } from "../../components/common/transaction-info"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { DeployForm } from "./deploy-form"

function getDeployRequest(data: Record<string, any>) {
	switch (data["blockchain"]) {
		case BlockchainGroup.ETHEREUM:
			return {
				blockchain: data["blockchain"] as CreateCollectionBlockchains,
				asset: {
					assetType: data["contract"],
					arguments: {
						name: data["name"],
						symbol: data["symbol"],
						baseURI: data["baseURI"],
						contractURI: data["contractURI"],
						isUserToken: !!data["private"],
						operators: []
					},
				},
			} as CreateCollectionRequest
		case Blockchain.TEZOS:
			return {
				blockchain: data["blockchain"] as CreateCollectionBlockchains,
				asset: {
					assetType: data["collection"],
					arguments: {
						name: data["name"],
						symbol: data["symbol"],
						contractURI: data["contractURI"],
						isUserToken: !!data["private"],
					},
				},
			} as CreateCollectionRequest
		case Blockchain.SOLANA:
			return {
				blockchain: data["blockchain"] as CreateCollectionBlockchains,
				asset: {
					arguments: {
						metadataURI: data["metadataURI"],
					},
				},
			} as CreateCollectionRequest
		default:
			throw new Error("Unsupported blockchain")
	}
}

function validateConditions(blockchain: BlockchainGroup | undefined): boolean {
	return blockchain === BlockchainGroup.ETHEREUM ||
		blockchain === BlockchainGroup.TEZOS ||
		blockchain === BlockchainGroup.SOLANA
}

export function DeployPage() {
	const connection = useContext(ConnectorContext)
	const form = useForm()
	const { handleSubmit } = form
	const { result, setComplete, setError } = useRequestResult()
	const blockchain = connection.sdk?.wallet?.blockchain

	return (
		<Page header="Deploy Collection">
			{
				!validateConditions(blockchain) && (
					<CommentedBlock sx={{ my: 2 }}>
						<UnsupportedBlockchainWarning blockchain={blockchain}/>
					</CommentedBlock>
				)
			}
			<CommentedBlock sx={{ my: 2 }} comment={<CollectionDeployComment/>}>
				<form
					onSubmit={handleSubmit(async (formData) => {
						try {
							setComplete(await connection.sdk?.nft.deploy(getDeployRequest(formData)))
						} catch (e) {
							setError(e)
						}
					})}
				>
					<Stack spacing={2}>
						{
							blockchain &&
							<FormSelect
								form={form}
								defaultValue={blockchain}
								name="blockchain"
								label="Blockchain"
							>
								<MenuItem value={BlockchainGroup.ETHEREUM}>
									{Blockchain.ETHEREUM} / {Blockchain.POLYGON}
								</MenuItem>
								<MenuItem value={BlockchainGroup.TEZOS}>{BlockchainGroup.TEZOS}</MenuItem>
								<MenuItem value={Blockchain.SOLANA}>{Blockchain.SOLANA}</MenuItem>
								{ /*<MenuItem value={Blockchain.FLOW}>{Blockchain.FLOW}</MenuItem>*/ }
							</FormSelect>
						}
						<DeployForm form={form}/>
						<Box>
							<FormSubmit
								form={form}
								label="Deploy"
								state={resultToState(result.type)}
								disabled={!validateConditions(blockchain)}
							/>
						</Box>
					</Stack>
				</form>
			</CommentedBlock>

			<CommentedBlock sx={{ my: 2 }} comment={result.type === "complete" ? <CollectionResultComment/> : null}>
				<RequestResult
					result={result}
					completeRender={(data) =>
						<>
							<Box sx={{ my: 2 }}>
								<Typography variant="overline">Collection Address:</Typography>
								<div>
									<InlineCode>{data?.address}</InlineCode> <CopyToClipboard value={data?.address}/>
								</div>
							</Box>
							<Box sx={{ my: 2 }}>
								<TransactionInfo transaction={data?.tx}/>
							</Box>
						</>
					}
				/>
			</CommentedBlock>
		</Page>
	)
}
