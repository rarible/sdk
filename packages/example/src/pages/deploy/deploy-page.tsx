import { Box, MenuItem, Stack, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import { Blockchain } from "@rarible/api-client"
import type { CreateCollectionBlockchains } from "@rarible/sdk/build/types/nft/deploy/domain"
import type { CreateCollectionRequestSimplified } from "@rarible/sdk/build/types/nft/deploy/simplified"
import { WalletType } from "@rarible/sdk-wallet"
import { isEVMBlockchain } from "@rarible/sdk-common"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormSubmit } from "../../components/common/form/form-submit"
import { FormSelect } from "../../components/common/form/form-select"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { RequestResult } from "../../components/common/request-result"
import { InlineCode } from "../../components/common/inline-code"
import { CopyToClipboard } from "../../components/common/copy-to-clipboard"
import { TransactionInfo } from "../../components/common/transaction-info"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { useSdkContext } from "../../components/connector/sdk"
import { CollectionResultComment } from "./comments/collection-result-comment"
import { CollectionDeployComment } from "./comments/collection-deploy-comment"
import { DeployForm } from "./deploy-form"

function getDeployRequest(data: Record<string, any>) {
  if (isEVMBlockchain(data["blockchain"])) {
    return {
      blockchain: data["blockchain"] as CreateCollectionBlockchains,
      type: data["contract"],
      name: data["name"],
      symbol: data["symbol"],
      baseURI: data["baseURI"],
      contractURI: data["contractURI"],
      isPublic: !data["private"],
      operators: [],
    } as CreateCollectionRequestSimplified
  }
  switch (data["blockchain"]) {
    case WalletType.SOLANA:
      return {
        blockchain: data["blockchain"] as CreateCollectionBlockchains,
        metadataURI: data["metadataURI"],
      } as CreateCollectionRequestSimplified
    case WalletType.APTOS:
      return {
        blockchain: data["blockchain"] as CreateCollectionBlockchains,
        name: data["name"],
        description: data["description"],
        uri: data["uri"],
      } as CreateCollectionRequestSimplified
    default:
      throw new Error("Unsupported blockchain")
  }
}

function validateConditions(blockchain: WalletType | undefined): boolean {
  return blockchain === WalletType.ETHEREUM || blockchain === WalletType.SOLANA || blockchain === WalletType.APTOS
}

export function DeployPage() {
  const connection = useSdkContext()
  const form = useForm()
  const { result, setComplete, setError } = useRequestResult()
  const blockchain = connection.sdk.wallet?.walletType

  return (
    <Page header="Deploy Collection">
      {!validateConditions(blockchain) && (
        <CommentedBlock sx={{ my: 2 }}>
          <UnsupportedBlockchainWarning blockchain={blockchain} />
        </CommentedBlock>
      )}
      <CommentedBlock sx={{ my: 2 }} comment={<CollectionDeployComment />}>
        <form
          onSubmit={form.handleSubmit(async formData => {
            try {
              if (formData["blockchain"] === Blockchain.ETHEREUM) {
                formData.blockchain = (connection.state as any)?.connection.blockchain
              }
              console.log("connection", connection, getDeployRequest(formData), formData)

              setComplete(await connection.sdk.nft.createCollection(getDeployRequest(formData)))
            } catch (e) {
              setError(e)
            }
          })}
        >
          <Stack spacing={2}>
            {blockchain && (
              <FormSelect form={form} defaultValue={blockchain} name="blockchain" label="Blockchain">
                <MenuItem value={WalletType.ETHEREUM}>EVM Blockchain</MenuItem>
                <MenuItem value={Blockchain.SOLANA}>{Blockchain.SOLANA}</MenuItem>
                <MenuItem value={Blockchain.APTOS}>{Blockchain.APTOS}</MenuItem>
                {/*<MenuItem value={Blockchain.FLOW}>{Blockchain.FLOW}</MenuItem>*/}
              </FormSelect>
            )}
            <DeployForm form={form} />
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

      <CommentedBlock sx={{ my: 2 }} comment={result.type === "complete" ? <CollectionResultComment /> : null}>
        <RequestResult
          result={result}
          completeRender={data => (
            <>
              <Box sx={{ my: 2 }}>
                <Typography variant="overline">Collection Address:</Typography>
                <div>
                  <InlineCode>{data?.address}</InlineCode> <CopyToClipboard value={data?.address} />
                </div>
              </Box>
              <Box sx={{ my: 2 }}>
                <TransactionInfo transaction={data?.tx} />
              </Box>
            </>
          )}
        />
      </CommentedBlock>
    </Page>
  )
}
