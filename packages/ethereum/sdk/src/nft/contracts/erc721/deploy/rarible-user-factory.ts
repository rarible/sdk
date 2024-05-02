import type { Address } from "@rarible/types"
import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider"

export function createErc721UserFactoryContract(ethereum: Ethereum, address?: Address): EthereumContract {
	return ethereum.createContract(erc721UserFactoryABI, address)
}

export const erc721UserFactoryABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_beacon",
				"type": "address",
			},
		],
		"stateMutability": "nonpayable",
		"type": "constructor",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "proxy",
				"type": "address",
			},
		],
		"name": "Create721RaribleUserProxy",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address",
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address",
			},
		],
		"name": "OwnershipTransferred",
		"type": "event",
	},
	{
		"inputs": [],
		"name": "beacon",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address",
			},
		],
		"stateMutability": "view",
		"type": "function",
		"constant": true,
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address",
			},
		],
		"stateMutability": "view",
		"type": "function",
		"constant": true,
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address",
			},
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string",
			},
			{
				"internalType": "string",
				"name": "_symbol",
				"type": "string",
			},
			{
				"internalType": "string",
				"name": "baseURI",
				"type": "string",
			},
			{
				"internalType": "string",
				"name": "contractURI",
				"type": "string",
			},
			{
				"internalType": "address[]",
				"name": "operators",
				"type": "address[]",
			},
			{
				"internalType": "uint256",
				"name": "salt",
				"type": "uint256",
			},
		],
		"name": "createToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string",
			},
			{
				"internalType": "string",
				"name": "_symbol",
				"type": "string",
			},
			{
				"internalType": "string",
				"name": "baseURI",
				"type": "string",
			},
			{
				"internalType": "string",
				"name": "contractURI",
				"type": "string",
			},
			{
				"internalType": "address[]",
				"name": "operators",
				"type": "address[]",
			},
			{
				"internalType": "uint256",
				"name": "_salt",
				"type": "uint256",
			},
		],
		"name": "getAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address",
			},
		],
		"stateMutability": "view",
		"type": "function",
		"constant": true,
	},
] as const
