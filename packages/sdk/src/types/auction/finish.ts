import type { AuctionId } from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"

export type IAuctionFinish = (auctionId: AuctionId) => Promise<IBlockchainTransaction>
