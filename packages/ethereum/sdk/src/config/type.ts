import type { EVMAddress } from "@rarible/types"
import type { Word } from "@rarible/types"
import type { EVMBlockchain } from "@rarible/sdk-common"
import type { EthereumSdkEnvironment } from "../types"

export type ExchangeAddresses = {
  v1: EVMAddress
  v2: EVMAddress
  openseaV1: EVMAddress
  wrapper: EVMAddress
  looksrare?: EVMAddress
  looksrareV2?: EVMAddress
  x2y2: EVMAddress
}

export type TransferProxies = {
  nft: EVMAddress
  erc20: EVMAddress
  erc721Lazy: EVMAddress
  erc1155Lazy: EVMAddress
  openseaV1: EVMAddress
  cryptoPunks: EVMAddress
}

export type OpenSeaConfig = {
  metadata: Word
  proxyRegistry: EVMAddress
  merkleValidator?: EVMAddress
}

export type FactoriesAddresses = {
  erc721: EVMAddress
  erc1155: EVMAddress
}

export type CryptoPunksConfig = {
  marketContract: EVMAddress
  wrapperContract: EVMAddress
}

export type SudoswapConfig = {
  pairFactory: EVMAddress
  pairRouter: EVMAddress
}

export type EthereumConfig = {
  basePath: string
  blockchain: EVMBlockchain
  environment: EthereumSdkEnvironment
  chainId: number
  exchange: ExchangeAddresses
  transferProxies: TransferProxies
  feeConfigUrl: string
  openSea: OpenSeaConfig
  factories: FactoriesAddresses
  weth: EVMAddress
  auction: EVMAddress
  cryptoPunks: CryptoPunksConfig
  sudoswap: SudoswapConfig
  looksrareOrderValidatorV2?: EVMAddress
}
