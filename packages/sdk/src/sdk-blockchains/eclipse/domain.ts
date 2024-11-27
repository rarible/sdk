import type { PublicKey } from "@solana/web3.js"

export interface IEclipseSdkConfig {
  eclipseEndpoint?: string
  eclipseMarketplaces: Array<PublicKey>
}
