import type { Cluster, Commitment, ConnectionConfig } from "@solana/web3.js"
import { clusterApiUrl, Connection } from "@solana/web3.js"
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
}

export interface ISolanaSdkConfig {
	connection: {
		cluster: Cluster
		commitmentOrConfig?: Commitment | ConnectionConfig
	}
}

export class SolanaSdk implements IRaribleSolanaSdk {
	public readonly balances: ISolanaBalancesSdk
	public readonly nft: ISolanaNftSdk
	public readonly order: ISolanaOrderSdk

	constructor(public readonly connection: Connection, public readonly cluster: Cluster) {
		this.balances = new SolanaBalancesSdk(connection)
		this.nft = new SolanaNftSdk(connection)
		this.order = new SolanaOrderSdk(connection)
	}

	static create(config: ISolanaSdkConfig): SolanaSdk {
		const connection = new Connection(clusterApiUrl(config.connection.cluster), config.connection.commitmentOrConfig)
		return new SolanaSdk(connection, config.connection.cluster)
	}
}