import type { BigNumberValue } from "@rarible/utils"

export enum SupportedChainId {
  MAINNET = 1,
  GOERLI = 5,
}

/**
 * /!\ This type is used for the signature and should perfectly match the object signed by the user
 * Do not update unless the contract has been updated
 */
export interface MakerOrder {
  isOrderAsk: boolean // true --> ask / false --> bid
  signer: string // signer address of the maker order
  collection: string // collection address
  price: BigNumberValue
  tokenId: BigNumberValue // id of the token
  amount: BigNumberValue // amount of tokens to sell/purchase (must be 1 for ERC721, 1+ for ERC1155)
  strategy: string // strategy for trade execution (e.g., DutchAuction, StandardSaleForFixedPrice)
  currency: string // currency address
  nonce: BigNumberValue
  startTime: BigNumberValue // startTime in timestamp
  endTime: BigNumberValue // endTime in timestamp
  minPercentageToAsk: BigNumberValue
  params: any[] // params (e.g., price, target account for private sale)
}
export type BytesLike = ArrayLike<number> | string

export interface MakerOrderWithEncodedParams extends Omit<MakerOrder, "params"> {
  params: BytesLike
}

/** MakerOrderWithSignature matches the type used for API order mutations and contract calls. */
export interface MakerOrderWithSignature extends MakerOrder {
  signature: string
}

/** MakerOrderWithVRS match the type sent to the contract when executing a trade */
export interface MakerOrderWithVRS extends Omit<MakerOrder, "params"> {
  v: number
  r: string
  s: string
  params: BytesLike
}

export interface TakerOrder {
  isOrderAsk: boolean // true --> ask / false --> bid
  taker: string // Taker address
  price: BigNumberValue // price for the purchase
  tokenId: BigNumberValue
  minPercentageToAsk: BigNumberValue
  params: any[] // params (e.g., price)
}

export interface TakerOrderWithEncodedParams extends Omit<TakerOrder, "params"> {
  params: BytesLike
}

export interface ChainInfo {
  label: string
  appUrl: string
  rpcUrl: string
  explorer: string
  apiUrl: string
  osApiUrl: string
  cdnUrl: string
  rewardsSubgraphUrl: string
  cloudinaryUrl: string
}

export interface EVMAddresses {
  LOOKS: string
  LOOKS_LP: string
  WETH: string
  ROYALTY_FEE_MANAGER: string
  ROYALTY_FEE_REGISTRY: string
  ROYALTY_FEE_SETTER: string
  EXCHANGE: string
  TRANSFER_MANAGER_ERC721: string
  TRANSFER_MANAGER_ERC1155: string
  STRATEGY_STANDARD_SALE: string
  TRANSFER_SELECTOR_NFT: string
  STRATEGY_COLLECTION_SALE: string
  STRATEGY_PRIVATE_SALE: string
  STRATEGY_DUTCH_AUCTION: string
  PRIVATE_SALE_WITH_FEE_SHARING: string
  FEE_SHARING_SYSTEM: string
  STAKING_POOL_FOR_LOOKS_LP: string
  TOKEN_DISTRIBUTOR: string
  TRADING_REWARDS_DISTRIBUTOR: string
  MULTI_REWARDS_DISTRIBUTOR: string
  MULTICALL2: string
  REVERSE_RECORDS: string
  AGGREGATOR_UNISWAP_V3: string
  EXECUTION_MANAGER: string
  CURRENCY_MANAGER: string
}
