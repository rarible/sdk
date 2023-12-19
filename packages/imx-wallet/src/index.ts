import { Link, ProviderPreference } from "@imtbl/imx-sdk"
import type { ConfigurableIframeOptions } from "@imtbl/imx-sdk"
import type {
	ImxConnectionData,
	ImxConnectResult,
	ImxEnv,
	ImxNetwork,
	ImxNetworkConfig,
	ImxWalletConnectionStatus,
} from "./domain"
import { ImxWalletProviderEnum } from "./domain"
import { IMX_ENV_CONFIG, IMX_NETWORK_CONFIG } from "./config"

export class ImxWallet {
	private state: Record<StorageKeyEnum, string> = Object.keys(StorageKeyEnum).reduce((prev, curr) => ({
		...prev,
		[curr]: this.storage.getItem(curr) || "",
	}), {} as Record<StorageKeyEnum, string>)

	private status: ImxWalletConnectionStatus = this.state[StorageKeyEnum.IMX_ADDRESS] ? "connected" : "disconnected"

	public network = {
		...IMX_ENV_CONFIG[this.env],
		env: this.env,
	}

	public readonly link = new Link(this.network.linkAddress, this.iframeOptions, "v3")

	constructor(
		private readonly env: ImxEnv,
		private readonly provider: ImxWalletProviderEnum = ImxWalletProviderEnum.NONE,
		private readonly iframeOptions?: ConfigurableIframeOptions,
		private readonly storage: Storage = localStorage
	) {}

	connect = async (): Promise<ImxConnectResult> => {
		try {
			const data = await this.link.setup(this.getSetupOptions())
			if (data.address && data.starkPublicKey) {
				this.status = "connected"
				this.state = {
					[StorageKeyEnum.IMX_ADDRESS]: data.address,
					[StorageKeyEnum.IMX_STARK_KEY]: data.starkPublicKey,
					[StorageKeyEnum.IMX_ETH_NETWORK]: data.ethNetwork,
					[StorageKeyEnum.IMX_PROVIDER]: data.providerPreference,
				}
				this.setValue(StorageKeyEnum.IMX_ADDRESS, data.address)
				this.setValue(StorageKeyEnum.IMX_STARK_KEY, data.starkPublicKey)
				this.setValue(StorageKeyEnum.IMX_ETH_NETWORK, data.ethNetwork)
				this.setValue(StorageKeyEnum.IMX_PROVIDER, data.providerPreference)
				return data
			}
			throw new Error("There is no address or starkAddress in response")
		} catch (error) {
			console.error("Connection failed with reason", error)
			throw error
		}
	}

	disconnect = () => {
		Object.keys(StorageKeyEnum).forEach(x => this.setValue(x as StorageKeyEnum, ""))
		this.status = "disconnected"
	}

	getConnectionData = (): ImxConnectionData => ({
		address: this.state[StorageKeyEnum.IMX_ADDRESS],
		starkPublicKey: this.state[StorageKeyEnum.IMX_STARK_KEY],
		ethNetwork: this.state[StorageKeyEnum.IMX_ETH_NETWORK],
		providerPreference: this.state[StorageKeyEnum.IMX_PROVIDER],
		link: this.link,
		status: this.status,
	})

	private getSetupOptions() {
		return this.provider ? { providerPreference: ProviderPreference[this.provider] } : {}
	}

	private setValue(key: StorageKeyEnum, value: string) {
		this.state[key] = value
		return this.storage.setItem(key, value)
	}
}

enum StorageKeyEnum {
	IMX_STARK_KEY = "IMX_STARK_KEY",
	IMX_ADDRESS = "IMX_ADDRESS",
	IMX_PROVIDER = "IMX_PROVIDER",
	IMX_ETH_NETWORK = "IMX_ETH_NETWORK",
}

export type { ImxNetwork, ImxEnv, ImxNetworkConfig, ImxWalletProviderEnum }
export { IMX_NETWORK_CONFIG, IMX_ENV_CONFIG }