import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider"
import type { Address } from "@rarible/ethereum-api-client"

export function createLooksrareV2Validator(ethereum: Ethereum, address?: Address): EthereumContract {
	return ethereum.createContract(LOOKSRARE_V2_VALIDATOR_ABI, address)
}

export const LOOKSRARE_V2_VALIDATOR_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_looksRareProtocol",
				"type": "address",
			},
		],
		"stateMutability": "nonpayable",
		"type": "constructor",
	},
	{
		"inputs": [],
		"name": "CRITERIA_GROUPS",
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
		"name": "ERC1155_INTERFACE_ID",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "ERC721_INTERFACE_ID_1",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "ERC721_INTERFACE_ID_2",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "MAGIC_VALUE_ORDER_NONCE_EXECUTED",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32",
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
						"internalType": "enum QuoteType",
						"name": "quoteType",
						"type": "uint8",
					},
					{
						"internalType": "uint256",
						"name": "globalNonce",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "subsetNonce",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "orderNonce",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "strategyId",
						"type": "uint256",
					},
					{
						"internalType": "enum CollectionType",
						"name": "collectionType",
						"type": "uint8",
					},
					{
						"internalType": "address",
						"name": "collection",
						"type": "address",
					},
					{
						"internalType": "address",
						"name": "currency",
						"type": "address",
					},
					{
						"internalType": "address",
						"name": "signer",
						"type": "address",
					},
					{
						"internalType": "uint256",
						"name": "startTime",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "endTime",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256",
					},
					{
						"internalType": "uint256[]",
						"name": "itemIds",
						"type": "uint256[]",
					},
					{
						"internalType": "uint256[]",
						"name": "amounts",
						"type": "uint256[]",
					},
					{
						"internalType": "bytes",
						"name": "additionalParameters",
						"type": "bytes",
					},
				],
				"internalType": "struct OrderStructs.Maker",
				"name": "makerOrder",
				"type": "tuple",
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes",
			},
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "root",
						"type": "bytes32",
					},
					{
						"components": [
							{
								"internalType": "bytes32",
								"name": "value",
								"type": "bytes32",
							},
							{
								"internalType": "enum OrderStructs.MerkleTreeNodePosition",
								"name": "position",
								"type": "uint8",
							},
						],
						"internalType": "struct OrderStructs.MerkleTreeNode[]",
						"name": "proof",
						"type": "tuple[]",
					},
				],
				"internalType": "struct OrderStructs.MerkleTree",
				"name": "merkleTree",
				"type": "tuple",
			},
		],
		"name": "checkMakerOrderValidity",
		"outputs": [
			{
				"internalType": "uint256[9]",
				"name": "validationCodes",
				"type": "uint256[9]",
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
						"internalType": "enum QuoteType",
						"name": "quoteType",
						"type": "uint8",
					},
					{
						"internalType": "uint256",
						"name": "globalNonce",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "subsetNonce",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "orderNonce",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "strategyId",
						"type": "uint256",
					},
					{
						"internalType": "enum CollectionType",
						"name": "collectionType",
						"type": "uint8",
					},
					{
						"internalType": "address",
						"name": "collection",
						"type": "address",
					},
					{
						"internalType": "address",
						"name": "currency",
						"type": "address",
					},
					{
						"internalType": "address",
						"name": "signer",
						"type": "address",
					},
					{
						"internalType": "uint256",
						"name": "startTime",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "endTime",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256",
					},
					{
						"internalType": "uint256[]",
						"name": "itemIds",
						"type": "uint256[]",
					},
					{
						"internalType": "uint256[]",
						"name": "amounts",
						"type": "uint256[]",
					},
					{
						"internalType": "bytes",
						"name": "additionalParameters",
						"type": "bytes",
					},
				],
				"internalType": "struct OrderStructs.Maker[]",
				"name": "makerOrders",
				"type": "tuple[]",
			},
			{
				"internalType": "bytes[]",
				"name": "signatures",
				"type": "bytes[]",
			},
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "root",
						"type": "bytes32",
					},
					{
						"components": [
							{
								"internalType": "bytes32",
								"name": "value",
								"type": "bytes32",
							},
							{
								"internalType": "enum OrderStructs.MerkleTreeNodePosition",
								"name": "position",
								"type": "uint8",
							},
						],
						"internalType": "struct OrderStructs.MerkleTreeNode[]",
						"name": "proof",
						"type": "tuple[]",
					},
				],
				"internalType": "struct OrderStructs.MerkleTree[]",
				"name": "merkleTrees",
				"type": "tuple[]",
			},
		],
		"name": "checkMultipleMakerOrderValidities",
		"outputs": [
			{
				"internalType": "uint256[9][]",
				"name": "validationCodes",
				"type": "uint256[9][]",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "creatorFeeManager",
		"outputs": [
			{
				"internalType": "contract ICreatorFeeManager",
				"name": "",
				"type": "address",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "deriveProtocolParameters",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "domainSeparator",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "looksRareProtocol",
		"outputs": [
			{
				"internalType": "contract LooksRareProtocol",
				"name": "",
				"type": "address",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "maxCreatorFeeBp",
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
		"name": "royaltyFeeRegistry",
		"outputs": [
			{
				"internalType": "contract IRoyaltyFeeRegistry",
				"name": "",
				"type": "address",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "transferManager",
		"outputs": [
			{
				"internalType": "contract TransferManager",
				"name": "",
				"type": "address",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
]
