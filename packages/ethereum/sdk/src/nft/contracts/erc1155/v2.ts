import type { AbiItem } from "../../../common/abi-item"

export const erc1155v2Abi: AbiItem[] = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
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
				"indexed": false,
				"internalType": "address",
				"name": "owner",
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
		"name": "CreateERC1155Rarible",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "owner",
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
		"name": "CreateERC1155RaribleUser",
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
				"components": [
					{
						"internalType": "address payable",
						"name": "account",
						"type": "address",
					},
					{
						"internalType": "uint96",
						"name": "value",
						"type": "uint96",
					},
				],
				"indexed": false,
				"internalType": "struct LibPart.Part[]",
				"name": "creators",
				"type": "tuple[]",
			},
		],
		"name": "Creators",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "hasApproval",
				"type": "bool",
			},
		],
		"name": "DefaultApproval",
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
				"components": [
					{
						"internalType": "address payable",
						"name": "account",
						"type": "address",
					},
					{
						"internalType": "uint96",
						"name": "value",
						"type": "uint96",
					},
				],
				"indexed": false,
				"internalType": "struct LibPart.Part[]",
				"name": "royalties",
				"type": "tuple[]",
			},
		],
		"name": "RoyaltiesSet",
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
				"internalType": "uint256",
				"name": "value",
				"type": "uint256",
			},
		],
		"name": "Supply",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address",
			},
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
				"indexed": false,
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]",
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "values",
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
				"name": "operator",
				"type": "address",
			},
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
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
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
				"name": "value",
				"type": "string",
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256",
			},
		],
		"name": "URI",
		"type": "event",
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "id",
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
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "accounts",
				"type": "address[]",
			},
			{
				"internalType": "uint256[]",
				"name": "ids",
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
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "baseURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256",
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256",
			},
		],
		"name": "burn",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address",
			},
			{
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]",
			},
			{
				"internalType": "uint256[]",
				"name": "values",
				"type": "uint256[]",
			},
		],
		"name": "burnBatch",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "contractURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
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
		"name": "creators",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "account",
				"type": "address",
			},
			{
				"internalType": "uint96",
				"name": "value",
				"type": "uint96",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256",
			},
		],
		"name": "getCreators",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address payable",
						"name": "account",
						"type": "address",
					},
					{
						"internalType": "uint96",
						"name": "value",
						"type": "uint96",
					},
				],
				"internalType": "struct LibPart.Part[]",
				"name": "",
				"type": "tuple[]",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256",
			},
		],
		"name": "getRaribleV2Royalties",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address payable",
						"name": "account",
						"type": "address",
					},
					{
						"internalType": "uint96",
						"name": "value",
						"type": "uint96",
					},
				],
				"internalType": "struct LibPart.Part[]",
				"name": "",
				"type": "tuple[]",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
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
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string",
			},
		],
		"stateMutability": "view",
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
				"name": "from",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address",
			},
			{
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]",
			},
			{
				"internalType": "uint256[]",
				"name": "amounts",
				"type": "uint256[]",
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes",
			},
		],
		"name": "safeBatchTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
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
				"name": "id",
				"type": "uint256",
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256",
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes",
			},
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
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
		"stateMutability": "nonpayable",
		"type": "function",
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
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "tokenId",
						"type": "uint256",
					},
					{
						"internalType": "string",
						"name": "tokenURI",
						"type": "string",
					},
					{
						"internalType": "uint256",
						"name": "supply",
						"type": "uint256",
					},
					{
						"components": [
							{
								"internalType": "address payable",
								"name": "account",
								"type": "address",
							},
							{
								"internalType": "uint96",
								"name": "value",
								"type": "uint96",
							},
						],
						"internalType": "struct LibPart.Part[]",
						"name": "creators",
						"type": "tuple[]",
					},
					{
						"components": [
							{
								"internalType": "address payable",
								"name": "account",
								"type": "address",
							},
							{
								"internalType": "uint96",
								"name": "value",
								"type": "uint96",
							},
						],
						"internalType": "struct LibPart.Part[]",
						"name": "royalties",
						"type": "tuple[]",
					},
					{
						"internalType": "bytes[]",
						"name": "signatures",
						"type": "bytes[]",
					},
				],
				"internalType": "struct LibERC1155LazyMint.Mint1155Data",
				"name": "data",
				"type": "tuple",
			},
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
				"name": "amount",
				"type": "uint256",
			},
		],
		"name": "transferFromOrMint",
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
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256",
			},
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
		],
		"name": "updateAccount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
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
		"stateMutability": "view",
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
		],
		"name": "__ERC1155RaribleUser_init",
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
				"internalType": "address",
				"name": "transferProxy",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "lazyTransferProxy",
				"type": "address",
			},
		],
		"name": "__ERC1155Rarible_init",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "tokenId",
						"type": "uint256",
					},
					{
						"internalType": "string",
						"name": "tokenURI",
						"type": "string",
					},
					{
						"internalType": "uint256",
						"name": "supply",
						"type": "uint256",
					},
					{
						"components": [
							{
								"internalType": "address payable",
								"name": "account",
								"type": "address",
							},
							{
								"internalType": "uint96",
								"name": "value",
								"type": "uint96",
							},
						],
						"internalType": "struct LibPart.Part[]",
						"name": "creators",
						"type": "tuple[]",
					},
					{
						"components": [
							{
								"internalType": "address payable",
								"name": "account",
								"type": "address",
							},
							{
								"internalType": "uint96",
								"name": "value",
								"type": "uint96",
							},
						],
						"internalType": "struct LibPart.Part[]",
						"name": "royalties",
						"type": "tuple[]",
					},
					{
						"internalType": "bytes[]",
						"name": "signatures",
						"type": "bytes[]",
					},
				],
				"internalType": "struct LibERC1155LazyMint.Mint1155Data",
				"name": "data",
				"type": "tuple",
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256",
			},
		],
		"name": "mintAndTransfer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
]

export type ERC1155V2Abi = typeof erc1155v2Abi
