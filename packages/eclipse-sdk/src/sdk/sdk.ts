import type { Cluster, Commitment, ConnectionConfig } from "@solana/web3.js"
import { clusterApiUrl, Connection } from "@solana/web3.js"
import type { IEclipseBalancesSdk } from "./balance/balance"
import { EclipseBalancesSdk } from "./balance/balance"

export interface IEclipseSdkConfig {
  connection: {
    cluster: Cluster
    endpoint?: string
    commitmentOrConfig?: Commitment | ConnectionConfig
  }
}

export class EclipseSdk {
  public readonly balances: IEclipseBalancesSdk

  constructor(
    public readonly connection: Connection,
    public readonly cluster: Cluster,
  ) {
    this.balances = new EclipseBalancesSdk(connection)
  }

  static create(config: IEclipseSdkConfig): EclipseSdk {
    const connection = new Connection(
      config.connection.endpoint ?? clusterApiUrl(config.connection.cluster),
      config.connection.commitmentOrConfig ?? "confirmed",
    )
    return new EclipseSdk(connection, config.connection.cluster)
  }
}
