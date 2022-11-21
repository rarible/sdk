import type { Address } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider"
import type { AbiItem } from "../../common/abi-item"

export function createExchangeWrapperContract(ethereum: Ethereum, address?: Address): EthereumContract {
	return ethereum.createContract(EXCHANGEV2_BULK_ABI, address)
}

export const EXCHANGEV2_BULK_ABI: AbiItem[] = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_wyvernExchange",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "_exchangeV2",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "_seaPort",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "_x2y2",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "_looksRare",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "_sudoswap",
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
				"internalType": "bool",
				"name": "result",
				"type": "bool",
			},
		],
		"name": "Execution",
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
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bool",
				"name": "paused",
				"type": "bool",
			},
		],
		"name": "Paused",
		"type": "event",
	},
	{
		"inputs": [],
		"name": "exchangeV2",
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
		"name": "looksRare",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address",
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]",
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]",
			},
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes",
			},
		],
		"name": "onERC1155BatchReceived",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4",
			},
		],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256",
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256",
			},
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes",
			},
		],
		"name": "onERC1155Received",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4",
			},
		],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256",
			},
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes",
			},
		],
		"name": "onERC721Received",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4",
			},
		],
		"stateMutability": "nonpayable",
		"type": "function",
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
		"inputs": [
			{
				"internalType": "bool",
				"name": "_paused",
				"type": "bool",
			},
		],
		"name": "pause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool",
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
		"inputs": [],
		"name": "seaPort",
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
		"name": "sudoswap",
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
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4",
			},
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool",
			},
		],
		"stateMutability": "view",
		"type": "function",
		"constant": true,
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
		"inputs": [],
		"name": "wyvernExchange",
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
		"name": "x2y2",
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
		"stateMutability": "payable",
		"type": "receive" as any,
		"payable": true,
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "enum ExchangeWrapper.Markets",
						"name": "marketId",
						"type": "uint8",
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "fees",
						"type": "uint256",
					},
					{
						"internalType": "bytes",
						"name": "data",
						"type": "bytes",
					},
				],
				"internalType": "struct ExchangeWrapper.PurchaseDetails",
				"name": "purchaseDetails",
				"type": "tuple",
			},
			{
				"internalType": "address",
				"name": "feeRecipientFirst",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "feeRecipientSecond",
				"type": "address",
			},
		],
		"name": "singlePurchase",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function",
		"payable": true,
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "enum ExchangeWrapper.Markets",
						"name": "marketId",
						"type": "uint8",
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "fees",
						"type": "uint256",
					},
					{
						"internalType": "bytes",
						"name": "data",
						"type": "bytes",
					},
				],
				"internalType": "struct ExchangeWrapper.PurchaseDetails[]",
				"name": "purchaseDetails",
				"type": "tuple[]",
			},
			{
				"internalType": "address",
				"name": "feeRecipientFirst",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "feeRecipientSecond",
				"type": "address",
			},
			{
				"internalType": "bool",
				"name": "allowFail",
				"type": "bool",
			},
		],
		"name": "bulkPurchase",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function",
		"payable": true,
	},
]
