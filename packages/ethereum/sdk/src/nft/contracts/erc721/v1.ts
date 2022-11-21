import type { AbiItem } from "../../../common/abi-item"

export const erc721v1Abi: AbiItem[] = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string",
			},
			{
				"internalType": "string",
				"name": "symbol",
				"type": "string",
			},
			{
				"internalType": "string",
				"name": "contractURIPrefix",
				"type": "string",
			},
			{
				"internalType": "string",
				"name": "tokenURIPrefix",
				"type": "string",
			},
			{
				"internalType": "address",
				"name": "signer",
				"type": "address",
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
				"name": "owner",
				"type": "address",
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "approved",
				"type": "address",
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256",
			},
		],
		"name": "Approval",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address",
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
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
		"name": "Create",
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
				"name": "from",
				"type": "address",
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address",
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256",
			},
		],
		"name": "Transfer",
		"type": "event",
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256",
			},
		],
		"name": "approve",
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
				"name": "owner",
				"type": "address",
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
		"constant": false,
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
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
		"inputs": [],
		"name": "contractURIPrefix",
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
				"name": "tokenId",
				"type": "uint256",
			},
		],
		"name": "getApproved",
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
				"internalType": "address",
				"name": "owner",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "operator",
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
		"constant": true,
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256",
			},
		],
		"name": "ownerOf",
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
				"name": "from",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256",
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
				"name": "from",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
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
				"name": "to",
				"type": "address",
			},
			{
				"internalType": "bool",
				"name": "approved",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256",
			},
		],
		"name": "tokenByIndex",
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
				"internalType": "address",
				"name": "owner",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256",
			},
		],
		"name": "tokenOfOwnerByIndex",
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
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256",
			},
		],
		"name": "tokenURI",
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
		"constant": true,
		"inputs": [],
		"name": "totalSupply",
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
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256",
			},
		],
		"name": "transferFrom",
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
		"constant": false,
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
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
				"internalType": "string",
				"name": "tokenURI",
				"type": "string",
			},
		],
		"name": "mint",
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
		"constant": false,
		"inputs": [
			{
				"internalType": "string",
				"name": "contractURIPrefix",
				"type": "string",
			},
		],
		"name": "setContractURIPrefix",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
]
