import type Web3 from "web3"
import type { Address } from "@rarible/ethereum-api-client"
import type { Contract } from "web3-eth-contract"
import type { AbiItem } from "../common/abi-item"

export function createCryptoPunkAssetMatcherContract(web3: Web3, address?: Address): Contract {
	return new web3.eth.Contract(punkAssetMatcherAbi, address)
}

export async function deployCryptoPunkAssetMatcher(web3: Web3) {
	const empty = createCryptoPunkAssetMatcherContract(web3)
	const [address] = await web3.eth.getAccounts()
	return empty.deploy({ data: punksAssetMatcherBytecode }).send({ from: address, gas: 4000000, gasPrice: "0" })
}
export const punkAssetMatcherAbi: AbiItem[] = [
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "bytes4",
						"name": "assetClass",
						"type": "bytes4",
					},
					{
						"internalType": "bytes",
						"name": "data",
						"type": "bytes",
					},
				],
				"internalType": "struct LibAsset.AssetType",
				"name": "leftAssetType",
				"type": "tuple",
			},
			{
				"components": [
					{
						"internalType": "bytes4",
						"name": "assetClass",
						"type": "bytes4",
					},
					{
						"internalType": "bytes",
						"name": "data",
						"type": "bytes",
					},
				],
				"internalType": "struct LibAsset.AssetType",
				"name": "rightAssetType",
				"type": "tuple",
			},
		],
		"name": "matchAssets",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bytes4",
						"name": "assetClass",
						"type": "bytes4",
					},
					{
						"internalType": "bytes",
						"name": "data",
						"type": "bytes",
					},
				],
				"internalType": "struct LibAsset.AssetType",
				"name": "",
				"type": "tuple",
			},
		],
		"stateMutability": "pure",
		"type": "function",
	},
]
export const punksAssetMatcherBytecode = "0x608060405234801561001057600080fd5b5061035f806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80636d3f7cb014610030575b600080fd5b61004361003e366004610236565b610059565b6040516100509190610297565b60405180910390f35b610061610121565b600080846020015180602001905181019061007c91906101fe565b91509150600080856020015180602001905181019061009b91906101fe565b9150915080831480156100bf5750816001600160a01b0316846001600160a01b0316145b156100f25750506040805180820190915284516001600160e01b031916815260208086015190820152925061011b915050565b505060408051808201825260008082528251602081810190945290815291810191909152925050505b92915050565b60408051808201909152600081526060602082015290565b60006040828403121561014a578081fd5b6040516040810167ffffffffffffffff828210818311171561016857fe5b816040528293508435915063ffffffff60e01b8216821461018857600080fd5b908252602090848201358181111561019f57600080fd5b8501601f810187136101b057600080fd5b8035828111156101bc57fe5b6101ce601f8201601f19168501610305565b925080835287848284010111156101e457600080fd5b808483018585013760009083018401525091015292915050565b60008060408385031215610210578182fd5b82516001600160a01b0381168114610226578283fd5b6020939093015192949293505050565b60008060408385031215610248578182fd5b823567ffffffffffffffff8082111561025f578384fd5b61026b86838701610139565b93506020850135915080821115610280578283fd5b5061028d85828601610139565b9150509250929050565b6000602080835263ffffffff60e01b84511681840152808401516040808501528051806060860152835b818110156102dd578281018401518682016080015283016102c1565b818111156102ee5784608083880101525b50601f01601f191693909301608001949350505050565b60405181810167ffffffffffffffff8111828210171561032157fe5b60405291905056fea2646970667358221220c15d520baa98eb1fa3af8e07cd2e9f84ba1d9322cd9cdb9c148fcfdf4744d6be64736f6c63430007060033"
