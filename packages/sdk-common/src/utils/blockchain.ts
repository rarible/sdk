import { Blockchain } from "@rarible/api-client"

export const EVMBlockchains = [
  Blockchain.ETHEREUM,
  Blockchain.POLYGON,
  Blockchain.MANTLE,
  Blockchain.ARBITRUM,
  Blockchain.ZKSYNC,
  Blockchain.CHILIZ,
  Blockchain.LIGHTLINK,
  Blockchain.RARI,
  Blockchain.ASTARZKEVM,
  Blockchain.BASE,
  Blockchain.FIEF,
  Blockchain.XAI,
  Blockchain.KROMA,
  Blockchain.CELO,
  Blockchain.SAAKURU,
  Blockchain.OASYS,
  Blockchain.SEI,
  Blockchain.MOONBEAM,
  Blockchain.PALM,
  Blockchain.ETHERLINK,
  Blockchain.LISK,
  Blockchain.ALEPHZERO,
  Blockchain.MATCH,
  Blockchain.FIVIRE,
  Blockchain.SHAPE,
  Blockchain.BERACHAIN,
  Blockchain.TELOS,
  Blockchain.ABSTRACT,
  Blockchain.VICTION,
  Blockchain.HEDERAEVM,
] as const

export type EVMBlockchain = (typeof EVMBlockchains)[number]

export function isEVMBlockchain(blockchain: string): blockchain is EVMBlockchain {
  return EVMBlockchains.includes(blockchain as EVMBlockchain)
}

export const NonEVMBlockchains = [
  Blockchain.FLOW,
  Blockchain.TEZOS,
  Blockchain.SOLANA,
  Blockchain.ECLIPSE,
  Blockchain.IMMUTABLEX,
  Blockchain.APTOS,
] as const

export const SupportedBlockchains = [...EVMBlockchains, ...NonEVMBlockchains] as const

export type SupportedBlockchain = Extract<Blockchain, (typeof SupportedBlockchains)[number]>
