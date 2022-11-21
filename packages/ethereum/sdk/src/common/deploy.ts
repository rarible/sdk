import type { Address } from "@rarible/types"
import type { EthereumTransaction } from "@rarible/ethereum-provider"

export type DeployContractRequest = (
	name: string, symbol: string, baseURI: string, contractURI: string
) => Promise<{tx: EthereumTransaction, address: Address}>

export type DeployUserContractRequest = (
	name: string, symbol: string, baseURI: string, contractURI: string, operators: Address[]
) => Promise<{tx: EthereumTransaction, address: Address}>

export interface DeployNft {
	erc721: {
		deployToken: DeployContractRequest,
		deployUserToken: DeployUserContractRequest,
	},
	erc1155: {
		deployToken: DeployContractRequest,
		deployUserToken: DeployUserContractRequest,
	},
}
