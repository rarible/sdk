import type { Connection } from "@solana/web3.js"
import { getRaribleMarketplaceProgram } from "../core/marketplace-program"

export const fetchOrderByAddress = async (connection: Connection, orderAddress: string) => {
  const marketplaceProgram = getRaribleMarketplaceProgram(connection)
  try {
    return await marketplaceProgram.account.order.fetch(orderAddress)
  } catch (e) {
    return undefined
  }
}

export const fetchMarketByAddress = async (connection: Connection, marketAddress: string) => {
  const marketplaceProgram = getRaribleMarketplaceProgram(connection)
  try {
    return await marketplaceProgram.account.market.fetch(marketAddress)
  } catch (e) {
    return undefined
  }
}
