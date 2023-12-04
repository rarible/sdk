import { Blockchain } from "@rarible/api-client/build/models/Blockchain"

export function getBlockchainFromChainId(chainId: number): EVMBlockchain {
	switch (chainId) {
		case 1:
		case 3:
		case 4:
		case 5:
		case 17:
		case 200500:
		case 300500:
			return Blockchain.ETHEREUM
		case 137:
		case 80001:
		case 200501:
		case 300501:
			return Blockchain.POLYGON
		case 5000:
		case 5001:
			return Blockchain.MANTLE
		default: throw new Error("ChainID from config could not be recognized")
	}
}

export type EVMBlockchain = Blockchain.ETHEREUM | Blockchain.POLYGON | Blockchain.MANTLE

export function convertEVMBlockchainToUnionBlockchain(blockchain: EVMBlockchain): Blockchain {
	if (Blockchain[blockchain]) {
		return Blockchain[blockchain]
	}
	throw new Error(`convertEVMBlockchainToUnionBlockchain: unrecognized blockchain ${blockchain}`)
}

export function getUnionBlockchainFromChainId(chainId: number): Blockchain {
	return convertEVMBlockchainToUnionBlockchain(getBlockchainFromChainId(chainId))
}
