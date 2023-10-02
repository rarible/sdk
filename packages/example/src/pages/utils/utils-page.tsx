import React, { useContext, useState } from "react"
import { WalletType } from "@rarible/sdk-wallet"
import type { AxiosInstance } from "axios"
import axios from "axios"
import { Box, Button } from "@mui/material"
import { Page } from "../../components/page"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { SetupCollection } from "./components/setup-collection"
import { SetupMattelCollections } from "./components/setup-mattel-collections"
import { SardineCheckout } from "./components/sardine-checkout"
import { ExecuteRawTransaction } from "./components/execute-raw-transaction"
import { SignTypedDataUtil } from "./components/sign-typed-data"
import { ProviderActions } from "./components/provider-actions"

const OFFRAMP_URLS = {
	PROD: "https://crypto.sardine.ai",
	SANDBOX: "https://crypto.sandbox.sardine.ai",
}

export class ClientTokenStorage {
  private clientToken: string | undefined
  private expiresAt: Date | undefined
  client: AxiosInstance
  private offrampUrl: string
  constructor(private readonly clientId: string, private readonly clientSecret: string, env: "prod" | "sandbox") {
  	const isProd = env === "prod"
  	this.offrampUrl = isProd ? OFFRAMP_URLS.PROD : OFFRAMP_URLS.SANDBOX
  	this.client = axios.create({
  		baseURL: isProd ? "https://api.sardine.ai/v1" : "https://api.sandbox.sardine.ai/v1",
  		headers: {
  			"Content-Type": "application/json",
  		},
  	})
  	this.client.interceptors.request.use(async (config) => {
  		if (config.url && !config.url.startsWith("/auth/client-tokens")) {
  		  (config.headers as Record<string, string>)["Authorization"] = `Basic ${await this.getToken()}`
  		}
  		return config
  	})
  }

  private getBase64Token() {
  	const stringToEncode = `${this.clientId}:${this.clientSecret}`
  	return new Buffer(stringToEncode).toString("base64")
  }

  async getToken(): Promise<string> {
  	if (this.clientToken && this.expiresAt && new Date() < this.expiresAt) {
  		return this.clientToken
  	}
  	try {
  		const { data } = await this.client.post("/auth/client-tokens", {}, {
  			headers: {
  				"Authorization": `Basic ${this.getBase64Token()}`,
  			},
  		})
  		this.clientToken = data.clientToken
  		this.expiresAt = new Date(data.expiresAt)
  		return data.clientToken
  	} catch (error) {
  		throw error
  	}
  }

  async getSupportedTokens() {
  	return this.client.get("/supported-tokens")
  }

  async getGeoCoverage() {
  	return this.client.get("/geo-coverage")
  }

  async getSellLink(o: GetSellLinkOptions) {
  	const params = {
  		address: o.address,
  		fixed_crypto_amount: o.cryptoAmount,
  		fixed_fiat_currency: o.fiatCurrency,
  		asset_type: o.assetType,
  		network: o.network,
  		client_token: await clientTokenStorage.getToken(),
  	}
  	const urlParams = new URLSearchParams(params)

  	return `${this.offrampUrl}/sell?${urlParams.toString()}`
  }
}

export type GetSellLinkOptions = {
	address: string
	cryptoAmount: string
	fiatCurrency: string
	assetType: string
	network: string
}
const clientId = "7e15bfe6-b698-49d2-a392-fd4b1855992e"
const clientSecret = "4f361bcc-d7a2-4c44-b877-1f81938bb558"
const clientTokenStorage = new ClientTokenStorage(clientId, clientSecret, "sandbox")

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

	async function renderIframe() {
		const token = await clientTokenStorage.getToken()
		const url = `https://crypto.sandbox.sardine.ai/sell?address=0xEE5DA6b5cDd5b5A22ECEB75b84C7864573EB4FeC&fixed_crypto_amount=0.04&fixed_fiat_currency=USD&asset_type=ETH&network=ethereum&client_token=${token}`
		setIframeUrl(url)
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
					variant="outlined"
					component="span"
					onClick={() => renderIframe()}
				>
          Get token
				</Button>
			</Box>

			{ iframeUrl && <iframe src={iframeUrl} onLoad={attachListener} width={500} height={700} allow="camera *;geolocation *" id="sardine_iframe" /> }
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
