import { useState } from "react"
import type { WalletType } from "@rarible/sdk-wallet"
import { LoadingButton } from "@mui/lab"
import { Alert, Box, TextField, Typography } from "@mui/material"
import { faCheck, faExclamationCircle, faFileSignature } from "@fortawesome/free-solid-svg-icons"
import type { UserSignature } from "@rarible/sdk-wallet"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { Icon } from "../../components/common/icon"
import { InlineCode } from "../../components/common/inline-code"
import { CopyToClipboard } from "../../components/common/copy-to-clipboard"
import { useSdkContext } from "../../components/connector/sdk"
import { SignMessageComment } from "./comments/signmessage-comment"

function validateConditions(blockchain: WalletType | undefined): boolean {
  return !!blockchain
}

export function SignPage() {
  const connection = useSdkContext()
  const blockchain = connection.sdk.wallet?.walletType
  const [input, setInput] = useState("")
  const [isSigning, setSigning] = useState(false)
  const [error, setError] = useState(undefined)
  const [result, setResult] = useState<UserSignature | undefined>(undefined)

  return (
    <Page header="Sign Message">
      {!validateConditions(blockchain) && (
        <CommentedBlock sx={{ my: 2 }}>
          <UnsupportedBlockchainWarning blockchain={blockchain} />
        </CommentedBlock>
      )}
      <CommentedBlock sx={{ my: 2 }} comment={<SignMessageComment />}>
        <Box sx={{ my: 2 }}>
          <TextField
            fullWidth={true}
            label="Input Text"
            multiline
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </Box>
        <Box sx={{ my: 2 }}>
          <LoadingButton
            loading={isSigning}
            loadingPosition="start"
            startIcon={<Icon icon={faFileSignature} />}
            color="primary"
            variant="contained"
            disabled={input === "" || !validateConditions(blockchain)}
            onClick={async () => {
              try {
                setSigning(true)
                const res = await connection?.sdk?.wallet?.signPersonalMessage(input)
                setSigning(false)
                setResult(res)
                setError(undefined)
              } catch (e: any) {
                console.error(e)
                setSigning(false)
                setError(e.message || e.toString())
              }
            }}
          >
            Sign
          </LoadingButton>
        </Box>
        <Box sx={{ my: 2 }}>
          {error && (
            <Alert variant="outlined" severity="error" icon={<Icon icon={faExclamationCircle} />}>
              {error}
            </Alert>
          )}
          {!error && result && (
            <Alert variant="outlined" severity="success" icon={<Icon icon={faCheck} />}>
              <Typography variant="overline">Signature:</Typography>
              <div>
                <InlineCode wrap>{result.signature}</InlineCode> <CopyToClipboard value={result.signature} />
              </div>
              <Box sx={{ my: 2 }}>
                <Typography variant="overline">Public Key:</Typography>
                <div>
                  <InlineCode wrap>{result.publicKey}</InlineCode> <CopyToClipboard value={result.publicKey} />
                </div>
              </Box>
              <Box sx={{ my: 2 }}>
                <Typography variant="overline">Message:</Typography>
                <div>
                  <pre>{result.message}</pre> <CopyToClipboard value={result.message} />
                </div>
              </Box>
            </Alert>
          )}
        </Box>
      </CommentedBlock>
    </Page>
  )
}
