import { Link, ProviderPreference } from "@imtbl/imx-sdk"
import type {
	ImxConnectResult,
	ImxEnv,
	ImxNetwork,
	ImxNetworkConfig,
	ImxWalletConnectionStatus,
	ImxWalletProviderName,
} from "./domain"
import { IMX_ENV_CONFIG, IMX_NETWORK_CONFIG } from "./config"

const localStorageKeys = {
	starkKey: "IMX_STARK_KEY",
	address: "IMX_ADDRESS",
	provider: "IMX_PROVIDER",
	network: "IMX_ETH_NETWORK",
}

export class ImxWallet {
	private address: string
	private starkPublicKey: string
	private ethNetwork: string
	private providerPreference: string
	private status: ImxWalletConnectionStatus
	public link: Link

	constructor(
		private readonly env: ImxEnv,
		private readonly provider?: ImxWalletProviderName,
	) {
		this.link = new Link(this.getNetworkConfig().linkAddress)
		this.address = localStorage.getItem(localStorageKeys.address) || ""
		this.starkPublicKey = localStorage.getItem(localStorageKeys.starkKey) || ""
		this.ethNetwork = localStorage.getItem(localStorageKeys.network) || ""
		this.providerPreference = localStorage.getItem(localStorageKeys.provider) || ""
		this.status = this.address && this.starkPublicKey ? "connected" : "disconnected"
		this.connect = this.connect.bind(this)
		this.disconnect = this.disconnect.bind(this)
		this.getConnectionData = this.getConnectionData.bind(this)
		this.getNetworkConfig = this.getNetworkConfig.bind(this)
	}

	public async connect(): Promise<ImxConnectResult> {
		try {
			const { address, ethNetwork, providerPreference, starkPublicKey } = await this.link.setup(
				this.provider ? { providerPreference: ProviderPreference[this.provider] } : {},
			)
			if (address && starkPublicKey) {
				this.status = "connected"
				this.address = address
				this.starkPublicKey = starkPublicKey
				this.ethNetwork = ethNetwork
				this.providerPreference = providerPreference
				localStorage.setItem(localStorageKeys.address, address)
				localStorage.setItem(localStorageKeys.starkKey, starkPublicKey)
				localStorage.setItem(localStorageKeys.network, ethNetwork)
				localStorage.setItem(localStorageKeys.provider, providerPreference)
				return { address, starkPublicKey, ethNetwork, providerPreference }
			} else {
				throw new Error("Connection failure! there is no address or starkAddress in response")
			}
		} catch (e: any) {
			console.log(`Connection failed with reason: ${e}`)
			throw new Error(e)
		}
	}

	public disconnect() {
		this.address = ""
		this.starkPublicKey = ""
		this.ethNetwork = ""
		this.providerPreference = ""
		localStorage.setItem(localStorageKeys.address, "")
		localStorage.setItem(localStorageKeys.starkKey, "")
		this.status = "disconnected"

		if (localStorage) {
			if ("IMX_ETH_NETWORK" in localStorage) {
				localStorage.setItem("IMX_ETH_NETWORK", "")
			}
			if ("IMX_PROVIDER_PREFERENCE" in localStorage) {
				localStorage.setItem("IMX_PROVIDER_PREFERENCE", "")
			}
		}
	}

	public getConnectionData(): ImxConnectResult & { link: Link, status: ImxWalletConnectionStatus } {
		return {
			address: this.address,
			starkPublicKey: this.starkPublicKey,
			ethNetwork: this.ethNetwork,
			providerPreference: this.providerPreference,
			link: this.link,
			status: this.status,
		}
	}

	public getNetworkConfig(): ImxNetworkConfig & { env: ImxEnv } {
		return { ...IMX_ENV_CONFIG[this.env], env: this.env }
	}
}

export type { ImxNetwork, ImxEnv, ImxNetworkConfig }
export { IMX_NETWORK_CONFIG, IMX_ENV_CONFIG }
