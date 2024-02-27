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
] as const

export type EVMBlockchain = typeof EVMBlockchains[number]

export function isEVMBlockchain(blockchain: string): blockchain is EVMBlockchain {
	return EVMBlockchains.includes(blockchain as EVMBlockchain)
}

export const NonEVMBlockchains = [
	Blockchain.FLOW,
	Blockchain.TEZOS,
	Blockchain.SOLANA,
	Blockchain.IMMUTABLEX,
] as const

export const SupportedBlockchains = [
	...EVMBlockchains,
	...NonEVMBlockchains,
] as const

export type SupportedBlockchain = Extract<Blockchain, typeof SupportedBlockchains[number]>
