import type { AbiItem } from "../../../common/abi-item"

export const erc1155v1Abi: AbiItem[] = [
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
				"internalType": "address",
				"name": "signer",
				"type": "address",
			},
			{
				"internalType": "string",
				"name": "contractURI",
				"type": "string",
			},
			{
				"internalType": "string",
				"name": "tokenURIPrefix",
				"type": "string",
			},
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_owner",
				"type": "address",
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "_operator",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "_approved",
				"type": "bool",
			},
		],
		"name": "ApprovalForAll",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string",
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "symbol",
				"type": "string",
			},
		],
		"name": "CreateERC1155_v1",
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
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "address[]",
				"name": "recipients",
				"type": "address[]",
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "bps",
				"type": "uint256[]",
			},
		],
		"name": "SecondarySaleFees",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address",
			},
		],
		"name": "SignerAdded",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address",
			},
		],
		"name": "SignerRemoved",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_operator",
				"type": "address",
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "_from",
				"type": "address",
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "_to",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "_ids",
				"type": "uint256[]",
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "_values",
				"type": "uint256[]",
			},
		],
		"name": "TransferBatch",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_operator",
				"type": "address",
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "_from",
				"type": "address",
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "_to",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256",
			},
		],
		"name": "TransferSingle",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "_value",
				"type": "string",
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256",
			},
		],
		"name": "URI",
		"type": "event",
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address",
			},
		],
		"name": "addSigner",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256",
			},
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256",
			},
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "address[]",
				"name": "_owners",
				"type": "address[]",
			},
			{
				"internalType": "uint256[]",
				"name": "_ids",
				"type": "uint256[]",
			},
		],
		"name": "balanceOfBatch",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]",
			},
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256",
			},
			{
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256",
			},
		],
		"name": "burn",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "contractURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string",
			},
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256",
			},
		],
		"name": "creators",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address",
			},
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [
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
		],
		"name": "fees",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "recipient",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256",
			},
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256",
			},
		],
		"name": "getFeeBps",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]",
			},
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256",
			},
		],
		"name": "getFeeRecipients",
		"outputs": [
			{
				"internalType": "address payable[]",
				"name": "",
				"type": "address[]",
			},
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "_operator",
				"type": "address",
			},
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool",
			},
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "isOwner",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool",
			},
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address",
			},
		],
		"name": "isSigner",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool",
			},
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string",
			},
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address",
			},
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address",
			},
		],
		"name": "removeSigner",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [],
		"name": "renounceSigner",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "_from",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "_to",
				"type": "address",
			},
			{
				"internalType": "uint256[]",
				"name": "_ids",
				"type": "uint256[]",
			},
			{
				"internalType": "uint256[]",
				"name": "_values",
				"type": "uint256[]",
			},
			{
				"internalType": "bytes",
				"name": "_data",
				"type": "bytes",
			},
		],
		"name": "safeBatchTransferFrom",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "_from",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "_to",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256",
			},
			{
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256",
			},
			{
				"internalType": "bytes",
				"name": "_data",
				"type": "bytes",
			},
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "_operator",
				"type": "address",
			},
			{
				"internalType": "bool",
				"name": "_approved",
				"type": "bool",
			},
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "string",
				"name": "contractURI",
				"type": "string",
			},
		],
		"name": "setContractURI",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "string",
				"name": "tokenURIPrefix",
				"type": "string",
			},
		],
		"name": "setTokenURIPrefix",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"constant": true,
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
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string",
			},
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "tokenURIPrefix",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string",
			},
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address",
			},
		],
		"name": "transferOwnership",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256",
			},
		],
		"name": "uri",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string",
			},
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256",
			},
			{
				"internalType": "uint8",
				"name": "v",
				"type": "uint8",
			},
			{
				"internalType": "bytes32",
				"name": "r",
				"type": "bytes32",
			},
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32",
			},
			{
				"components": [
					{
						"internalType": "address payable",
						"name": "recipient",
						"type": "address",
					},
					{
						"internalType": "uint256",
						"name": "value",
						"type": "uint256",
					},
				],
				"internalType": "struct ERC1155Base.Fee[]",
				"name": "fees",
				"type": "tuple[]",
			},
			{
				"internalType": "uint256",
				"name": "supply",
				"type": "uint256",
			},
			{
				"internalType": "string",
				"name": "uri",
				"type": "string",
			},
		],
		"name": "mint",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
]

export type ERC1155V1Abi = typeof erc1155v1Abi
