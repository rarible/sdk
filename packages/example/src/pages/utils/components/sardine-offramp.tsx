import { useState } from "react"
import { Box, Button, Typography } from "@mui/material"
import { WalletType } from "@rarible/sdk-wallet"
import { OffRampClient } from "@rarible/connector-mattel"
import { getFlowTokenAddressByEnv } from "../../balance/utils/currencies"
import { useSdkContext } from "../../../components/connector/sdk"

export function SardineOfframp() {
  const connection = useSdkContext()
  const [iframeUrl, setIframeUrl] = useState("")
  const [quotesResult, setQuotesResult] = useState("")
  const [supportedTokens, setSupportedTokens] = useState("")

  async function renderIframe() {
    if (connection.sdk.wallet?.walletType === WalletType.ETHEREUM && connection.walletAddress) {
      const url = await clientTokenStorage.getSellLink({
        address: connection.walletAddress,
        cryptoAmount: "0.04",
        fiatCurrency: "USD",
        assetType: { "@type": "ETH" },
      })
      setIframeUrl(url)
    } else if (connection.sdk.wallet?.walletType === WalletType.FLOW && connection.walletAddress) {
      const url = await clientTokenStorage.getSellLink({
        address: connection.walletAddress,
        cryptoAmount: "110",
        fiatCurrency: "USD",
        assetType: {
          "@type": "FLOW_FT",
          contract: getFlowTokenAddressByEnv("testnet"),
        },
      })
      setIframeUrl(url)
    } else {
      throw new Error("Available only for ETH")
    }
  }

  async function getQuotes() {
    if (connection.sdk.wallet?.walletType === WalletType.ETHEREUM && connection.walletAddress) {
      const quotes = await clientTokenStorage.getQuotes({
        cryptoAmount: "0.04",
        fiatCurrency: "USD",
        assetType: { "@type": "ETH" },
        address: connection.walletAddress,
      })
      setQuotesResult(JSON.stringify(quotes, null, "  "))
    } else if (connection.sdk.wallet?.walletType === WalletType.FLOW && connection.walletAddress) {
      const quotes = await clientTokenStorage.getQuotes({
        cryptoAmount: "3",
        fiatCurrency: "USD",
        address: connection.walletAddress,
        assetType: {
          "@type": "FLOW_FT",
          contract: getFlowTokenAddressByEnv("testnet"),
        },
      })
      setQuotesResult(JSON.stringify(quotes, null, "  "))
    } else {
      throw new Error("Available only for ETH")
    }
  }

  async function getSupportedTokens() {
    const tokens = await clientTokenStorage.getSupportedTokens()
    setSupportedTokens(JSON.stringify(tokens, null, "  "))
  }

  return (
    <>
      <Typography sx={{ my: 2 }} variant="subtitle1" gutterBottom>
        Off ramp functionality
      </Typography>

      <Box sx={{ my: 2 }}>
        <Button style={{ marginRight: 10 }} variant="outlined" component="span" onClick={() => getQuotes()}>
          Get Offramp Quotes
        </Button>
        for wallet: {connection?.walletAddress}
      </Box>

      {quotesResult && (
        <Box sx={{ my: 2 }}>
          <pre>{quotesResult}</pre>
        </Box>
      )}

      <Box sx={{ my: 2 }}>
        <Button style={{ marginRight: 10 }} variant="outlined" component="span" onClick={() => getSupportedTokens()}>
          Get supported tokens
        </Button>
      </Box>

      {supportedTokens && (
        <Box sx={{ my: 2 }}>
          <pre>{supportedTokens}</pre>
        </Box>
      )}

      <Box sx={{ my: 2 }}>
        <Button variant="outlined" component="span" onClick={() => renderIframe()}>
          Render Offramp Iframe
        </Button>
      </Box>

      {iframeUrl && (
        <iframe
          title="iframe"
          style={{ border: 0 }}
          src={iframeUrl}
          onLoad={attachListener}
          width={500}
          height={700}
          id="sardine_iframe"
        />
      )}
    </>
  )
}

const clientId = "7e15bfe6-b698-49d2-a392-fd4b1855992e"
const clientSecret = "4f361bcc-d7a2-4c44-b877-1f81938bb558"
const clientTokenStorage = new OffRampClient(clientId, clientSecret, "sandbox")

function attachListener() {
  window.addEventListener(
    "message",
    e => {
      if (e.data) {
        try {
          const data = JSON.parse(e.data)
          if (!["failed", "expired", "cancelled", "error"].includes(data.status)) {
            console.log(data.data.depositAddress)
          }
          if (data.status === "draft") {
            console.log("orderId", data?.data?.orderId)
          }
        } catch (e) {}
      }
    },
    false,
  )
}
