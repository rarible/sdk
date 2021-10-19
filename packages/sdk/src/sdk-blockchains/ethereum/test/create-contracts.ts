import Web3 from "web3"
import { UnionAddress } from "@rarible/types"
import { Contract } from "web3-eth-contract"

import { erc721v2Abi } from "@rarible/protocol-ethereum-sdk/build/nft/contracts/erc721/v2"
import { erc1155v1Abi } from "@rarible/protocol-ethereum-sdk/build/nft/contracts/erc1155/v1"

export function createTestErc1155(web3: Web3, address?: UnionAddress): Contract {
	return new web3.eth.Contract(erc1155v1Abi, address)
}

export function createTestErc721(web3: Web3, address?: UnionAddress): Contract {
	return new web3.eth.Contract(erc721v2Abi, address)
}
