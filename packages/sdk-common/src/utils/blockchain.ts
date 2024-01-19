import { Blockchain } from "@rarible/api-client/build/models/Blockchain"

export type EVMBlockchain = Blockchain.ETHEREUM | Blockchain.POLYGON | Blockchain.MANTLE
| Blockchain.ARBITRUM | Blockchain.ZKSYNC | Blockchain.CHILIZ | Blockchain.LIGHTLINK
| Blockchain.RARI
export const EVMBlockchains: EVMBlockchain[] = [
	Blockchain.ETHEREUM,
	Blockchain.POLYGON,
	Blockchain.MANTLE,
	Blockchain.ARBITRUM,
	Blockchain.ZKSYNC,
	Blockchain.CHILIZ,
	Blockchain.LIGHTLINK,
	Blockchain.RARI,
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
