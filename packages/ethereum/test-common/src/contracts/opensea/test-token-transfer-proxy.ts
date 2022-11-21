import type Web3 from "web3"
import type { Address } from "@rarible/ethereum-api-client"
import type { Contract } from "web3-eth-contract"
import type { AbiItem } from "../../common/abi-item"

export function createOpenseaTokenTransferProxyContract(web3: Web3, address?: Address): Contract {
	return new web3.eth.Contract(tokenTransferProxyAbi, address)
}

export async function deployOpenseaTokenTransferProxy(web3: Web3, proxyRegistryAddress: string) {
	const empty = createOpenseaTokenTransferProxyContract(web3)
	const [address] = await web3.eth.getAccounts()
	return empty.deploy({
		data: tokenTransferProxyBytecode,
		arguments: [
			proxyRegistryAddress,
		],
	}).send({ from: address, gas: 8000000, gasPrice: "0" })
}

const tokenTransferProxyAbi: AbiItem[] = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "token",
				"type": "address",
			},
			{
				"name": "from",
				"type": "address",
			},
			{
				"name": "to",
				"type": "address",
			},
			{
				"name": "amount",
				"type": "uint256",
			},
		],
		"name": "transferFrom",
		"outputs": [
			{
				"name": "",
				"type": "bool",
			},
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "registry",
		"outputs": [
			{
				"name": "",
				"type": "address",
			},
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [
			{
				"name": "registryAddr",
				"type": "address",
			},
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor",
	},
]

export const tokenTransferProxyBytecode =
    "0x608060405234801561001057600080fd5b5060405160208061033b833981016040525160008054600160a060020a03909216600160a060020a03199092169190911790556102e9806100526000396000f30060806040526004361061004b5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166315dacbea81146100505780637b103999146100a1575b600080fd5b34801561005c57600080fd5b5061008d73ffffffffffffffffffffffffffffffffffffffff600435811690602435811690604435166064356100df565b604080519115158252519081900360200190f35b3480156100ad57600080fd5b506100b66102a1565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b60008054604080517f69dc9ff3000000000000000000000000000000000000000000000000000000008152336004820152905173ffffffffffffffffffffffffffffffffffffffff909216916369dc9ff39160248082019260209290919082900301818787803b15801561015257600080fd5b505af1158015610166573d6000803e3d6000fd5b505050506040513d602081101561017c57600080fd5b505115156101eb57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f3234000000000000000000000000000000000000000000000000000000000000604482015290519081900360640190fd5b604080517f23b872dd00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff86811660048301528581166024830152604482018590529151918716916323b872dd916064808201926020929091908290030181600087803b15801561026c57600080fd5b505af1158015610280573d6000803e3d6000fd5b505050506040513d602081101561029657600080fd5b505195945050505050565b60005473ffffffffffffffffffffffffffffffffffffffff16815600a165627a7a7230582041ec373058121e79976cdf0a6e6b363b36f27e87d8f3635fb2d0d8f19620dec30029"
