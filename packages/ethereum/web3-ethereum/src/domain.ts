import type Web3 from "web3"

export type Web3EthereumConfig = {
	web3: Web3
	from?: string
	gas?: number
}