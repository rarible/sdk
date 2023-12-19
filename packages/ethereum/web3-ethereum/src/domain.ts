import type Web3 from "web3"

export type Web3EthereumGasOptions = Partial<{
	gas: number
	gasPrice: string
}>

export type Web3EthereumConfig = Web3EthereumGasOptions & {
	web3: Web3
	from?: string
	alternateWeb3Instance?: Web3
}
