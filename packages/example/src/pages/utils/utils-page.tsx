import React, { useContext, useState } from "react"
import { WalletType } from "@rarible/sdk-wallet"
import { Box, Button } from "@mui/material"
import { OffRampClient } from "@rarible/connector-mattel/build/off-ramp"
import { Blockchain } from "@rarible/api-client"
import { Page } from "../../components/page"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { SetupCollection } from "./components/setup-collection"
import { SetupMattelCollections } from "./components/setup-mattel-collections"
import { SardineCheckout } from "./components/sardine-checkout"
import { ExecuteRawTransaction } from "./components/execute-raw-transaction"
import { SignTypedDataUtil } from "./components/sign-typed-data"
import { ProviderActions } from "./components/provider-actions"

const clientId = "7e15bfe6-b698-49d2-a392-fd4b1855992e"
const clientSecret = "4f361bcc-d7a2-4c44-b877-1f81938bb558"
const clientTokenStorage = new OffRampClient(clientId, clientSecret, "sandbox")

function attachListener() {
	window.addEventListener(
		"message",
		(e) => {
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
		false
	)
}
export function UtilsPage() {
	const connection = useContext(ConnectorContext)
	const blockchain = connection.sdk?.wallet?.walletType
	const isFlowActive = blockchain === WalletType.FLOW
	const isEVMActive = blockchain === WalletType.ETHEREUM
	const [iframeUrl, setIframeUrl] = useState("")
	const [quotesResult, setQuotesResult] = useState("")
	const [supportedTokens, setSupportedTokens] = useState("")

	async function renderIframe() {
		if (connection.sdk?.wallet?.walletType === WalletType.ETHEREUM && connection.walletAddress) {

			const url = await clientTokenStorage.getSellLink({
				address: connection.walletAddress,
				cryptoAmount: "0.04",
				fiatCurrency: "USD",
				assetType: { "@type": "ETH" },
			})
			setIframeUrl(url)
		} else {
			throw new Error("Available only for ETH")
		}
	}

	async function getQuotes() {
		if (connection.sdk?.wallet?.walletType === WalletType.ETHEREUM && connection.walletAddress) {

			const quotes = await clientTokenStorage.getQuotes({
				cryptoAmount: "0.04",
				fiatCurrency: "USD",
				assetType: { "@type": "ETH", blockchain: Blockchain.POLYGON },
				paymentType: "credit",
				address: connection.walletAddress,
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
		<Page header="Utils page">
			{
				isFlowActive && <FlowUtils/>
			}
			{
				isEVMActive && <EVMUtils/>
			}

			<Box sx={{ my: 2 }}>
				<Button
					style={{marginRight: 10}}
					variant="outlined"
					component="span"
					onClick={() => getQuotes()}
				>
          Get Offramp Quotes
				</Button>
        for wallet: {connection?.walletAddress}
			</Box>

			{
				quotesResult &&
        <Box sx={{my: 2}}>
        	<pre>{quotesResult}</pre>
        </Box>
			}

			<Box sx={{ my: 2 }}>
				<Button
					style={{marginRight: 10}}
					variant="outlined"
					component="span"
					onClick={() => getSupportedTokens()}
				>
          Get supported tokens
				</Button>
			</Box>

			{
				supportedTokens &&
        <Box sx={{my: 2}}>
        	<pre>{supportedTokens}</pre>
        </Box>
			}

			<Box sx={{ my: 2 }}>
				<Button
					variant="outlined"
					component="span"
					onClick={() => renderIframe()}
				>
          Render Offramp Iframe
				</Button>
			</Box>

			{ iframeUrl &&
        <iframe
        	style={{border: 0}}
        	src={iframeUrl}
        	onLoad={attachListener}
        	width={500}
        	height={700}
        	id="sardine_iframe"
        /> }
		</Page>
	)

}
export function FlowUtils() {
	return (
		<>
			<SetupCollection />
			<SetupMattelCollections />
			<SardineCheckout />
			<ExecuteRawTransaction />
		</>
	)
}

export function EVMUtils() {
	return (
		<>
			<SignTypedDataUtil />
			<ProviderActions/>
		</>
	)
}
