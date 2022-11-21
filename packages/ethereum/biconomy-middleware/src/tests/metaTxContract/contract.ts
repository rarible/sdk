import type { ContractMetadata } from "../../types"

export const rinkebyMetaTxContract = {
	name: "ERC721RaribleMeta",
	version: "1",
	address: "0x329ee2ea52e74ddd622bf06412f49e0177840d3c",
	abi: [
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
			"name": "CreateERC721Rarible",
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
			"name": "CreateERC721RaribleMeta",
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
			"name": "CreateERC721RaribleUser",
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
			"name": "CreateERC721RaribleUserMeta",
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
					"indexed": false,
					"internalType": "address",
					"name": "userAddress",
					"type": "address",
				},
				{
					"indexed": false,
					"internalType": "address payable",
					"name": "relayerAddress",
					"type": "address",
				},
				{
					"indexed": false,
					"internalType": "bytes",
					"name": "functionSignature",
					"type": "bytes",
				},
			],
			"name": "MetaTransactionExecuted",
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
			"name": "__ERC721RaribleUser_init",
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
			"name": "__ERC721Rarible_init",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function",
		},
		{
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
			"stateMutability": "nonpayable",
			"type": "function",
		},
		{
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
					"internalType": "uint256",
					"name": "tokenId",
					"type": "uint256",
				},
			],
			"name": "burn",
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
					"internalType": "address",
					"name": "userAddress",
					"type": "address",
				},
				{
					"internalType": "bytes",
					"name": "functionSignature",
					"type": "bytes",
				},
				{
					"internalType": "bytes32",
					"name": "sigR",
					"type": "bytes32",
				},
				{
					"internalType": "bytes32",
					"name": "sigS",
					"type": "bytes32",
				},
				{
					"internalType": "uint8",
					"name": "sigV",
					"type": "uint8",
				},
			],
			"name": "executeMetaTransaction",
			"outputs": [
				{
					"internalType": "bytes",
					"name": "",
					"type": "bytes",
				},
			],
			"stateMutability": "payable",
			"type": "function",
		},
		{
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
					"internalType": "address",
					"name": "user",
					"type": "address",
				},
			],
			"name": "getNonce",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "nonce",
					"type": "uint256",
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
					"internalType": "struct LibERC721LazyMint.Mint721Data",
					"name": "data",
					"type": "tuple",
				},
				{
					"internalType": "address",
					"name": "to",
					"type": "address",
				},
			],
			"name": "mintAndTransfer",
			"outputs": [],
			"stateMutability": "nonpayable",
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
					"internalType": "uint256",
					"name": "tokenId",
					"type": "uint256",
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
			"stateMutability": "view",
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
					"name": "tokenId",
					"type": "uint256",
				},
			],
			"name": "transferFrom",
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
					"internalType": "struct LibERC721LazyMint.Mint721Data",
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
			"name": "__ERC721RaribleUserMeta_init",
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
			"name": "__ERC721RaribleMeta_init",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function",
		},
	],
}

export const rinkebyMetaTxContractMetadata: ContractMetadata = {
	types: {
		EIP712Domain: [
			{ name: "name", type: "string" },
			{ name: "version", type: "string" },
			{ name: "verifyingContract", type: "address" },
			{ name: "salt", type: "bytes32" },
		],
		MetaTransaction: [
			{ name: "nonce", type: "uint256" },
			{ name: "from", type: "address" },
			{ name: "functionSignature", type: "bytes" },
		],
	},
	domain: {
		name: rinkebyMetaTxContract.name,
		version: rinkebyMetaTxContract.version,
		verifyingContract: rinkebyMetaTxContract.address,
		salt: "0x" + (4).toString(16).padStart(64, "0"),
	},
	primaryType: "MetaTransaction",
}
