import type { AxiosInstance } from "axios"
import axios from "axios"

const OFFRAMP_URLS = {
	PROD: "https://crypto.sardine.ai",
	SANDBOX: "https://crypto.sandbox.sardine.ai",
}

export class OffRampClient {
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
  		client_token: await this.getToken(),
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
