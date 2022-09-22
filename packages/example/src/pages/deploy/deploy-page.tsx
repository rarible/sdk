import React, { useContext } from "react"
import { Box, MenuItem, Stack, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import { Blockchain } from "@rarible/api-client"
import { CreateCollectionBlockchains } from "@rarible/sdk/build/types/nft/deploy/domain"
import { WalletType } from "@rarible/sdk-wallet"
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
import { CreateCollectionRequestSimplified } from "@rarible/sdk/build/types/nft/deploy/simplified";

function getDeployRequest(data: Record<string, any>) {
	switch (data["blockchain"]) {
		case Blockchain.POLYGON:
		case WalletType.ETHEREUM:
			return {
				blockchain: data["blockchain"] as CreateCollectionBlockchains,
        type: data["contract"],
        name: data["name"],
        symbol: data["symbol"],
        baseURI: data["baseURI"],
        contractURI: data["contractURI"],
        isPublic: !!data["private"],
        operators: []
			} as CreateCollectionRequestSimplified
		case Blockchain.TEZOS:
			return {
				blockchain: data["blockchain"] as CreateCollectionBlockchains,
        type: data["collection"],
        name: data["name"],
        description: data["description"],
        version: data["version"],
        authors: data["authors"],
        license: data["license"],
        homepage: data["homepage"],
        isPublic: !!data["private"],
			} as CreateCollectionRequestSimplified
		case WalletType.SOLANA:
			return {
				blockchain: data["blockchain"] as CreateCollectionBlockchains,
        metadataURI: data["metadataURI"],
			} as CreateCollectionRequestSimplified
		default:
			throw new Error("Unsupported blockchain")
	}
}

function validateConditions(blockchain: WalletType | undefined): boolean {
	return blockchain === WalletType.ETHEREUM ||
		blockchain === WalletType.TEZOS ||
		blockchain === WalletType.SOLANA
}

export function DeployPage() {
	const connection = useContext(ConnectorContext)
	const form = useForm()
	const { handleSubmit } = form
	const { result, setComplete, setError } = useRequestResult()
	const blockchain = connection.sdk?.wallet?.walletType

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
              if (
                formData["blockchain"] === Blockchain.ETHEREUM
                && (connection.state as any)?.connection.blockchain === Blockchain.POLYGON
              ) {
                  formData.blockchain = Blockchain.POLYGON
                }
							setComplete(await connection.sdk?.nft.createCollection(getDeployRequest(formData)))
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
								<MenuItem value={WalletType.ETHEREUM}>
									{Blockchain.ETHEREUM} / {Blockchain.POLYGON}
								</MenuItem>
								<MenuItem value={WalletType.TEZOS}>{WalletType.TEZOS}</MenuItem>
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
