import { Network } from "@aptos-labs/ts-sdk"

export const NFT_MARKETPLACE_MAP: Record<string, string> = {
  [Network.MAINNET]: "",
  [Network.TESTNET]: "0x6de37368e31dff4580b211295198159ee6f98b42ffa93c5683bb955ca1be67e0",
}

export function getMarketplaceAddress(network: Network) {
  if (!(network && NFT_MARKETPLACE_MAP[network])) {
    throw new Error("Network has not been found")
  }
  return NFT_MARKETPLACE_MAP[network]
}
