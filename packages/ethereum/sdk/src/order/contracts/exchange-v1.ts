import type { Address } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider"

export function createExchangeV1Contract(ethereum: Ethereum, address?: Address): EthereumContract {
	return ethereum.createContract(EXCHANGEV1_ABI, address)
}

export const EXCHANGEV1_ABI = [
	{
		"inputs": [
			{
				"internalType": "contract TransferProxy",
				"name": "_transferProxy",
				"type": "address",
			},
			{
				"internalType": "contract TransferProxyForDeprecated",
				"name": "_transferProxyForDeprecated",
				"type": "address",
			},
			{
				"internalType": "contract ERC20TransferProxy",
				"name": "_erc20TransferProxy",
				"type": "address",
			},
			{
				"internalType": "contract ExchangeStateV1",
				"name": "_state",
				"type": "address",
			},
			{
				"internalType": "contract ExchangeOrdersHolderV1",
				"name": "_ordersHolder",
				"type": "address",
			},
			{
				"internalType": "address payable",
				"name": "_beneficiary",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "_buyerFeeSigner",
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
				"name": "sellToken",
				"type": "address",
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "sellTokenId",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "sellValue",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "owner",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyToken",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "buyTokenId",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "buyValue",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyer",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "salt",
				"type": "uint256",
			},
		],
		"name": "Buy",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "sellToken",
				"type": "address",
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "sellTokenId",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "owner",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyToken",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "buyTokenId",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "salt",
				"type": "uint256",
			},
		],
		"name": "Cancel",
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
		"constant": true,
		"inputs": [],
		"name": "beneficiary",
		"outputs": [
			{
				"internalType": "address payable",
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
		"inputs": [],
		"name": "buyerFeeSigner",
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
		"inputs": [],
		"name": "erc20TransferProxy",
		"outputs": [
			{
				"internalType": "contract ERC20TransferProxy",
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
		"inputs": [],
		"name": "ordersHolder",
		"outputs": [
			{
				"internalType": "contract ExchangeOrdersHolderV1",
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
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "state",
		"outputs": [
			{
				"internalType": "contract ExchangeStateV1",
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
		"inputs": [],
		"name": "transferProxy",
		"outputs": [
			{
				"internalType": "contract TransferProxy",
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
		"inputs": [],
		"name": "transferProxyForDeprecated",
		"outputs": [
			{
				"internalType": "contract TransferProxyForDeprecated",
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
				"internalType": "address payable",
				"name": "newBeneficiary",
				"type": "address",
			},
		],
		"name": "setBeneficiary",
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
				"name": "newBuyerFeeSigner",
				"type": "address",
			},
		],
		"name": "setBuyerFeeSigner",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"components": [
					{
						"components": [
							{
								"internalType": "address",
								"name": "owner",
								"type": "address",
							},
							{
								"internalType": "uint256",
								"name": "salt",
								"type": "uint256",
							},
							{
								"components": [
									{
										"internalType": "address",
										"name": "token",
										"type": "address",
									},
									{
										"internalType": "uint256",
										"name": "tokenId",
										"type": "uint256",
									},
									{
										"internalType": "enum ExchangeDomainV1.AssetType",
										"name": "assetType",
										"type": "uint8",
									},
								],
								"internalType": "struct ExchangeDomainV1.Asset",
								"name": "sellAsset",
								"type": "tuple",
							},
							{
								"components": [
									{
										"internalType": "address",
										"name": "token",
										"type": "address",
									},
									{
										"internalType": "uint256",
										"name": "tokenId",
										"type": "uint256",
									},
									{
										"internalType": "enum ExchangeDomainV1.AssetType",
										"name": "assetType",
										"type": "uint8",
									},
								],
								"internalType": "struct ExchangeDomainV1.Asset",
								"name": "buyAsset",
								"type": "tuple",
							},
						],
						"internalType": "struct ExchangeDomainV1.OrderKey",
						"name": "key",
						"type": "tuple",
					},
					{
						"internalType": "uint256",
						"name": "selling",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "buying",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "sellerFee",
						"type": "uint256",
					},
				],
				"internalType": "struct ExchangeDomainV1.Order",
				"name": "order",
				"type": "tuple",
			},
			{
				"components": [
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
				],
				"internalType": "struct ExchangeDomainV1.Sig",
				"name": "sig",
				"type": "tuple",
			},
			{
				"internalType": "uint256",
				"name": "buyerFee",
				"type": "uint256",
			},
			{
				"components": [
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
				],
				"internalType": "struct ExchangeDomainV1.Sig",
				"name": "buyerFeeSig",
				"type": "tuple",
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256",
			},
			{
				"internalType": "address",
				"name": "buyer",
				"type": "address",
			},
		],
		"name": "exchange",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "owner",
						"type": "address",
					},
					{
						"internalType": "uint256",
						"name": "salt",
						"type": "uint256",
					},
					{
						"components": [
							{
								"internalType": "address",
								"name": "token",
								"type": "address",
							},
							{
								"internalType": "uint256",
								"name": "tokenId",
								"type": "uint256",
							},
							{
								"internalType": "enum ExchangeDomainV1.AssetType",
								"name": "assetType",
								"type": "uint8",
							},
						],
						"internalType": "struct ExchangeDomainV1.Asset",
						"name": "sellAsset",
						"type": "tuple",
					},
					{
						"components": [
							{
								"internalType": "address",
								"name": "token",
								"type": "address",
							},
							{
								"internalType": "uint256",
								"name": "tokenId",
								"type": "uint256",
							},
							{
								"internalType": "enum ExchangeDomainV1.AssetType",
								"name": "assetType",
								"type": "uint8",
							},
						],
						"internalType": "struct ExchangeDomainV1.Asset",
						"name": "buyAsset",
						"type": "tuple",
					},
				],
				"internalType": "struct ExchangeDomainV1.OrderKey",
				"name": "key",
				"type": "tuple",
			},
		],
		"name": "cancel",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [
			{
				"components": [
					{
						"components": [
							{
								"internalType": "address",
								"name": "owner",
								"type": "address",
							},
							{
								"internalType": "uint256",
								"name": "salt",
								"type": "uint256",
							},
							{
								"components": [
									{
										"internalType": "address",
										"name": "token",
										"type": "address",
									},
									{
										"internalType": "uint256",
										"name": "tokenId",
										"type": "uint256",
									},
									{
										"internalType": "enum ExchangeDomainV1.AssetType",
										"name": "assetType",
										"type": "uint8",
									},
								],
								"internalType": "struct ExchangeDomainV1.Asset",
								"name": "sellAsset",
								"type": "tuple",
							},
							{
								"components": [
									{
										"internalType": "address",
										"name": "token",
										"type": "address",
									},
									{
										"internalType": "uint256",
										"name": "tokenId",
										"type": "uint256",
									},
									{
										"internalType": "enum ExchangeDomainV1.AssetType",
										"name": "assetType",
										"type": "uint8",
									},
								],
								"internalType": "struct ExchangeDomainV1.Asset",
								"name": "buyAsset",
								"type": "tuple",
							},
						],
						"internalType": "struct ExchangeDomainV1.OrderKey",
						"name": "key",
						"type": "tuple",
					},
					{
						"internalType": "uint256",
						"name": "selling",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "buying",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "sellerFee",
						"type": "uint256",
					},
				],
				"internalType": "struct ExchangeDomainV1.Order",
				"name": "order",
				"type": "tuple",
			},
			{
				"internalType": "uint256",
				"name": "fee",
				"type": "uint256",
			},
		],
		"name": "prepareBuyerFeeMessage",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string",
			},
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [
			{
				"components": [
					{
						"components": [
							{
								"internalType": "address",
								"name": "owner",
								"type": "address",
							},
							{
								"internalType": "uint256",
								"name": "salt",
								"type": "uint256",
							},
							{
								"components": [
									{
										"internalType": "address",
										"name": "token",
										"type": "address",
									},
									{
										"internalType": "uint256",
										"name": "tokenId",
										"type": "uint256",
									},
									{
										"internalType": "enum ExchangeDomainV1.AssetType",
										"name": "assetType",
										"type": "uint8",
									},
								],
								"internalType": "struct ExchangeDomainV1.Asset",
								"name": "sellAsset",
								"type": "tuple",
							},
							{
								"components": [
									{
										"internalType": "address",
										"name": "token",
										"type": "address",
									},
									{
										"internalType": "uint256",
										"name": "tokenId",
										"type": "uint256",
									},
									{
										"internalType": "enum ExchangeDomainV1.AssetType",
										"name": "assetType",
										"type": "uint8",
									},
								],
								"internalType": "struct ExchangeDomainV1.Asset",
								"name": "buyAsset",
								"type": "tuple",
							},
						],
						"internalType": "struct ExchangeDomainV1.OrderKey",
						"name": "key",
						"type": "tuple",
					},
					{
						"internalType": "uint256",
						"name": "selling",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "buying",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "sellerFee",
						"type": "uint256",
					},
				],
				"internalType": "struct ExchangeDomainV1.Order",
				"name": "order",
				"type": "tuple",
			},
		],
		"name": "prepareMessage",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string",
			},
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function",
	},
]
export const EXCHANGEV1_E2E_ADDRESS = "0x087a4Af184bC0189cFE55f2293a77EFe7A4f247C"
