import type { Cluster, Commitment, ConnectionConfig } from "@solana/web3.js"
import { clusterApiUrl, Connection } from "@solana/web3.js"
import { DebugLogger } from "../logger/debug-logger"
import type { IEclipseBalancesSdk } from "./balance/balance"
import { EclipseBalancesSdk } from "./balance/balance"
import type { IEclipseNftSdk } from "./nft/nft"
import { EclipseNftSdk } from "./nft/nft"
import type { IEclipseAccountSdk } from "./account/account"
import { EclipseAccountSdk } from "./account/account"

export interface IEclipseSdkConfig {
  connection: {
    cluster: Cluster
    endpoint?: string
    commitmentOrConfig?: Commitment | ConnectionConfig
  }
  debug?: boolean
}

export class EclipseSdk {
  public readonly debugLogger: DebugLogger

  public readonly balances: IEclipseBalancesSdk
  public readonly nft: IEclipseNftSdk
  public readonly account: IEclipseAccountSdk

  constructor(
    public readonly connection: Connection,
    public readonly cluster: Cluster,
    public readonly debug: boolean = false,
  ) {
    this.debugLogger = new DebugLogger(debug)

    this.balances = new EclipseBalancesSdk(connection)
    this.account = new EclipseAccountSdk(connection)

    this.nft = new EclipseNftSdk(connection, this.debugLogger, this.account)
  }

  static create(config: IEclipseSdkConfig): EclipseSdk {
    const connection = new Connection(
      config.connection.endpoint ?? clusterApiUrl(config.connection.cluster),
      config.connection.commitmentOrConfig ?? "confirmed",
    )
    return new EclipseSdk(connection, config.connection.cluster, config.debug)
  }

  confirmTransaction(...args: Parameters<typeof Connection.prototype.confirmTransaction>) {
    return this.connection.confirmTransaction(...args)
  }
}
