import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { EVMBlockchain } from "@rarible/sdk-common"
import { getBlockchainFromChainId } from "@rarible/protocol-ethereum-sdk/build/common"

export type WalletAndAddress = {
  wallet: BlockchainWallet
  address: string
}

export function getEvmBlockchain(chainId: number): EVMBlockchain {
  return getBlockchainFromChainId(chainId)
}
