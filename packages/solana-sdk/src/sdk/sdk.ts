import type { Cluster, Commitment, ConnectionConfig } from "@solana/web3.js"
import { clusterApiUrl, Connection } from "@solana/web3.js"
import { DebugLogger } from "../logger/debug-logger"
import type { ISolanaBalancesSdk } from "./balance/balance"
import type { ISolanaNftSdk } from "./nft/nft"
import type { ISolanaOrderSdk } from "./order/order"
import { SolanaBalancesSdk } from "./balance/balance"
import { SolanaNftSdk } from "./nft/nft"
import { SolanaOrderSdk } from "./order/order"

export interface IRaribleSolanaSdk {
	nft: ISolanaNftSdk
	balances: ISolanaBalancesSdk
	order: ISolanaOrderSdk
	confirmTransaction(
		...args: Parameters<typeof Connection.prototype.confirmTransaction>
	): ReturnType<typeof Connection.prototype.confirmTransaction>
}

export interface ISolanaSdkConfig {
	connection: {
		cluster: Cluster
		commitmentOrConfig?: Commitment | ConnectionConfig
	},
	debug?: boolean // console logging
}

interface ILoggingConfig {
	debug: boolean
}

export class SolanaSdk implements IRaribleSolanaSdk {
	public readonly balances: ISolanaBalancesSdk
	public readonly nft: ISolanaNftSdk
	public readonly order: ISolanaOrderSdk

	constructor(
		public readonly connection: Connection,
		public readonly cluster: Cluster,
		private readonly logging: ILoggingConfig
	) {
		const debugLogger = new DebugLogger(logging.debug)

		this.balances = new SolanaBalancesSdk(connection, debugLogger)
		this.nft = new SolanaNftSdk(connection, debugLogger)
		this.order = new SolanaOrderSdk(connection, debugLogger)
	}

	confirmTransaction(...args: Parameters<typeof Connection.prototype.confirmTransaction>) {
		return this.connection.confirmTransaction(...args)
	}

	static create(config: ISolanaSdkConfig): SolanaSdk {
		const connection = new Connection(clusterApiUrl(config.connection.cluster), config.connection.commitmentOrConfig)
		return new SolanaSdk(connection, config.connection.cluster, { debug: !!config.debug })
	}
}