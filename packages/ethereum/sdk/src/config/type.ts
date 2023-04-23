import type { Address } from "@rarible/ethereum-api-client"
import type { Word } from "@rarible/types"

export type ExchangeAddresses = {
	v1: Address
	v2: Address
	openseaV1: Address
	wrapper: Address
	looksrare?: Address
	looksrareV2?: Address
	x2y2: Address
}

export type TransferProxies = {
	nft: Address
	erc20: Address
	erc721Lazy: Address
	erc1155Lazy: Address
	openseaV1: Address
	cryptoPunks: Address
}

export type OpenSeaConfig = {
	metadata: Word
	proxyRegistry: Address
	merkleValidator?: Address
}

export type FactoriesAddresses = {
	erc721: Address
	erc1155: Address
}

export type CryptoPunksConfig = {
	marketContract: Address
	wrapperContract: Address
}

export type SudoswapConfig = {
	pairFactory: Address
	pairRouter: Address
}

export type EthereumConfig = {
	basePath: string
	chainId: number
	exchange: ExchangeAddresses
	transferProxies: TransferProxies
	feeConfigUrl: string
	openSea: OpenSeaConfig
	factories: FactoriesAddresses
	weth: Address
	auction: Address
	cryptoPunks: CryptoPunksConfig
	sudoswap: SudoswapConfig
	looksrareOrderValidatorV2?: Address
}
