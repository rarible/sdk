import type { Cluster, Commitment, ConnectionConfig } from "@solana/web3.js"

export interface IRaribleSolanaSdk {
  // nft: ISolanaNftSdk
  // balances: ISolanaBalancesSdk
  // order: ISolanaOrderSdk
  // confirmTransaction(
  //   ...args: Parameters<typeof Connection.prototype.confirmTransaction>
  // ): ReturnType<typeof Connection.prototype.confirmTransaction>
  // unionInstructionsAndSend(
  //   signer: SolanaSigner,
  //   preparedTransactions: PreparedTransaction[],
  //   commitment: Commitment,
  // ): Promise<TransactionResult>
}

export interface ISolanaSdkConfig {
  connection: {
    cluster: Cluster
    endpoint?: string
    commitmentOrConfig?: Commitment | ConnectionConfig
  }
  debug?: boolean // console logging
}

interface ILoggingConfig {
  debug: boolean
}

export class SolanaSdk implements IRaribleSolanaSdk {
  // public readonly debugLogger: DebugLogger
  //
  // public readonly balances: ISolanaBalancesSdk
  // public readonly nft: ISolanaNftSdk
  // public readonly order: ISolanaOrderSdk
  // public readonly collection: ISolanaCollectionSdk
  // public readonly auctionHouse: ISolanaAuctionHouseSdk
  // public readonly account: ISolanaAccountSdk
  //
  // constructor(
  //   public readonly connection: Connection,
  //   public readonly cluster: Cluster,
  //   private readonly logging: ILoggingConfig,
  // ) {
  //   this.debugLogger = new DebugLogger(logging.debug)
  //
  //   this.account = new SolanaAccountSdk(connection, this.debugLogger)
  //   this.balances = new SolanaBalancesSdk(connection, this.debugLogger)
  //   this.nft = new SolanaNftSdk(connection, this.debugLogger, this.account)
  //   this.order = new SolanaOrderSdk(connection, this.debugLogger)
  //   this.collection = new SolanaCollectionSdk(connection, this.debugLogger)
  //   this.auctionHouse = new SolanaAuctionHouseSdk(connection, this.debugLogger)
  // }
  //
  // confirmTransaction(...args: Parameters<typeof Connection.prototype.confirmTransaction>) {
  //   return this.connection.confirmTransaction(...args)
  // }
  //
  // async unionInstructionsAndSend(
  //   signer: SolanaSigner,
  //   preparedTransactions: PreparedTransaction[],
  //   commitment: Commitment,
  // ): Promise<TransactionResult> {
  //   const res = await sendTransactionWithRetry(
  //     this.connection,
  //     signer,
  //     preparedTransactions.reduce<TransactionInstruction[]>((acc, trans) => {
  //       acc.push(...trans.data.instructions)
  //       return acc
  //     }, []),
  //     preparedTransactions.reduce<SolanaSigner[]>((acc, trans) => {
  //       acc.push(...trans.data.signers)
  //       return acc
  //     }, []),
  //     commitment,
  //     this.debugLogger,
  //   )
  //
  //   preparedTransactions.forEach(trans => {
  //     trans.onSubmit?.(res)
  //   })
  //
  //   return res
  // }

  static create(config: ISolanaSdkConfig): SolanaSdk {
    // const connection = new Connection(
    //   config.connection.endpoint ?? clusterApiUrl(config.connection.cluster),
    //   config.connection.commitmentOrConfig ?? "confirmed",
    // )
    return new SolanaSdk()
    // return new SolanaSdk(connection, config.connection.cluster, { debug: !!config.debug })
  }
}
