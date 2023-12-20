import { Blockchain } from "@rarible/api-client/build/models/Blockchain"

export type EVMBlockchain = Blockchain.ETHEREUM | Blockchain.POLYGON | Blockchain.MANTLE
| Blockchain.ARBITRUM | Blockchain.ZKSYNC | Blockchain.CHILIZ
export const EVMBlockchains: EVMBlockchain[] = [
	Blockchain.ETHEREUM,
	Blockchain.POLYGON,
	Blockchain.MANTLE,
	Blockchain.ARBITRUM,
	Blockchain.ZKSYNC,
	Blockchain.CHILIZ,
]

/**
 * Return true if blockchain works like ethereum blockchain
 * @param blockchain
 */
export function isEVMBlockchain(blockchain: string): blockchain is EVMBlockchain {
	for (const b of EVMBlockchains) {
		if (b === blockchain) {
			return true
		}
	}
	return false
}

export const SupportedBlockchains = [
	...EVMBlockchains,
	Blockchain.FLOW,
	Blockchain.TEZOS,
	Blockchain.SOLANA,
	Blockchain.IMMUTABLEX,
] as const

export type SupportedBlockchain = PickEnum<Blockchain, typeof SupportedBlockchains[number]>

export type PickEnum<T, K extends T> = {
	[P in keyof K]: P extends K ? P : never;
}
