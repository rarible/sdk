import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider"
import type { Address } from "@rarible/types"
import type { AbiItem } from "../../common/abi-item"

export function createEthereumAuctionContract(ethereum: Ethereum, address?: Address): EthereumContract {
	return ethereum.createContract(testAuctionAbi, address)
}

export const testAuctionAbi: AbiItem[] = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "auctionId",
				"type": "uint256",
			},
		],
		"name": "AuctionCancelled",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "auctionId",
				"type": "uint256",
			},
			{
				"components": [
					{
						"components": [
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
								"name": "assetType",
								"type": "tuple",
							},
							{
								"internalType": "uint256",
								"name": "value",
								"type": "uint256",
							},
						],
						"internalType": "struct LibAsset.Asset",
						"name": "sellAsset",
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
						"name": "buyAsset",
						"type": "tuple",
					},
					{
						"components": [
							{
								"internalType": "uint256",
								"name": "amount",
								"type": "uint256",
							},
							{
								"internalType": "bytes4",
								"name": "dataType",
								"type": "bytes4",
							},
							{
								"internalType": "bytes",
								"name": "data",
								"type": "bytes",
							},
						],
						"internalType": "struct AuctionHouseBase.Bid",
						"name": "lastBid",
						"type": "tuple",
					},
					{
						"internalType": "address payable",
						"name": "seller",
						"type": "address",
					},
					{
						"internalType": "address payable",
						"name": "buyer",
						"type": "address",
					},
					{
						"internalType": "uint256",
						"name": "endTime",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "minimalStep",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "minimalPrice",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "protocolFee",
						"type": "uint256",
					},
					{
						"internalType": "bytes4",
						"name": "dataType",
						"type": "bytes4",
					},
					{
						"internalType": "bytes",
						"name": "data",
						"type": "bytes",
					},
				],
				"indexed": false,
				"internalType": "struct AuctionHouseBase.Auction",
				"name": "auction",
				"type": "tuple",
			},
		],
		"name": "AuctionCreated",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "auctionId",
				"type": "uint256",
			},
			{
				"components": [
					{
						"components": [
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
								"name": "assetType",
								"type": "tuple",
							},
							{
								"internalType": "uint256",
								"name": "value",
								"type": "uint256",
							},
						],
						"internalType": "struct LibAsset.Asset",
						"name": "sellAsset",
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
						"name": "buyAsset",
						"type": "tuple",
					},
					{
						"components": [
							{
								"internalType": "uint256",
								"name": "amount",
								"type": "uint256",
							},
							{
								"internalType": "bytes4",
								"name": "dataType",
								"type": "bytes4",
							},
							{
								"internalType": "bytes",
								"name": "data",
								"type": "bytes",
							},
						],
						"internalType": "struct AuctionHouseBase.Bid",
						"name": "lastBid",
						"type": "tuple",
					},
					{
						"internalType": "address payable",
						"name": "seller",
						"type": "address",
					},
					{
						"internalType": "address payable",
						"name": "buyer",
						"type": "address",
					},
					{
						"internalType": "uint256",
						"name": "endTime",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "minimalStep",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "minimalPrice",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "protocolFee",
						"type": "uint256",
					},
					{
						"internalType": "bytes4",
						"name": "dataType",
						"type": "bytes4",
					},
					{
						"internalType": "bytes",
						"name": "data",
						"type": "bytes",
					},
				],
				"indexed": false,
				"internalType": "struct AuctionHouseBase.Auction",
				"name": "auction",
				"type": "tuple",
			},
		],
		"name": "AuctionFinished",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "auctionId",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyer",
				"type": "address",
			},
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256",
					},
					{
						"internalType": "bytes4",
						"name": "dataType",
						"type": "bytes4",
					},
					{
						"internalType": "bytes",
						"name": "data",
						"type": "bytes",
					},
				],
				"indexed": false,
				"internalType": "struct AuctionHouseBase.Bid",
				"name": "bid",
				"type": "tuple",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256",
			},
		],
		"name": "BidPlaced",
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
				"internalType": "bytes4",
				"name": "assetType",
				"type": "bytes4",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "proxy",
				"type": "address",
			},
		],
		"name": "ProxyChange",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"components": [
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
						"name": "assetType",
						"type": "tuple",
					},
					{
						"internalType": "uint256",
						"name": "value",
						"type": "uint256",
					},
				],
				"indexed": false,
				"internalType": "struct LibAsset.Asset",
				"name": "asset",
				"type": "tuple",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "from",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "to",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "bytes4",
				"name": "transferDirection",
				"type": "bytes4",
			},
			{
				"indexed": false,
				"internalType": "bytes4",
				"name": "transferType",
				"type": "bytes4",
			},
		],
		"name": "Transfer",
		"type": "event",
	},
	{
		"inputs": [],
		"name": "defaultFeeReceiver",
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
				"internalType": "address",
				"name": "",
				"type": "address",
			},
		],
		"name": "feeReceivers",
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
				"internalType": "address",
				"name": "_collection",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256",
			},
		],
		"name": "getAuctionByToken",
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
	},
	{
		"inputs": [],
		"name": "protocolFee",
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
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "royaltiesRegistry",
		"outputs": [
			{
				"internalType": "contract IRoyaltiesProvider",
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
				"internalType": "address payable",
				"name": "newDefaultFeeReceiver",
				"type": "address",
			},
		],
		"name": "setDefaultFeeReceiver",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "wallet",
				"type": "address",
			},
		],
		"name": "setFeeReceiver",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newProtocolFee",
				"type": "uint256",
			},
		],
		"name": "setProtocolFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "contract IRoyaltiesProvider",
				"name": "newRoyaltiesRegistry",
				"type": "address",
			},
		],
		"name": "setRoyaltiesRegistry",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "assetType",
				"type": "bytes4",
			},
			{
				"internalType": "address",
				"name": "proxy",
				"type": "address",
			},
		],
		"name": "setTransferProxy",
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
				"internalType": "contract INftTransferProxy",
				"name": "_transferProxy",
				"type": "address",
			},
			{
				"internalType": "contract IERC20TransferProxy",
				"name": "_erc20TransferProxy",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "newProtocolFee",
				"type": "uint256",
			},
			{
				"internalType": "address",
				"name": "newDefaultFeeReceiver",
				"type": "address",
			},
			{
				"internalType": "contract IRoyaltiesProvider",
				"name": "newRoyaltiesProvider",
				"type": "address",
			},
		],
		"name": "__AuctionHouse_init",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"components": [
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
						"name": "assetType",
						"type": "tuple",
					},
					{
						"internalType": "uint256",
						"name": "value",
						"type": "uint256",
					},
				],
				"internalType": "struct LibAsset.Asset",
				"name": "_sellAsset",
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
				"name": "_buyAsset",
				"type": "tuple",
			},
			{
				"internalType": "uint256",
				"name": "minimalStep",
				"type": "uint256",
			},
			{
				"internalType": "uint256",
				"name": "minimalPrice",
				"type": "uint256",
			},
			{
				"internalType": "bytes4",
				"name": "dataType",
				"type": "bytes4",
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes",
			},
		],
		"name": "startAuction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_auctionId",
				"type": "uint256",
			},
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256",
					},
					{
						"internalType": "bytes4",
						"name": "dataType",
						"type": "bytes4",
					},
					{
						"internalType": "bytes",
						"name": "data",
						"type": "bytes",
					},
				],
				"internalType": "struct AuctionHouseBase.Bid",
				"name": "bid",
				"type": "tuple",
			},
		],
		"name": "putBid",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_auctionId",
				"type": "uint256",
			},
		],
		"name": "getMinimalNextBid",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "minBid",
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
				"name": "_auctionId",
				"type": "uint256",
			},
		],
		"name": "checkAuctionExistence",
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
				"internalType": "uint256",
				"name": "_auctionId",
				"type": "uint256",
			},
		],
		"name": "finishAuction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_auctionId",
				"type": "uint256",
			},
		],
		"name": "checkAuctionRangeTime",
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
				"internalType": "uint256",
				"name": "_auctionId",
				"type": "uint256",
			},
		],
		"name": "cancel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_auctionId",
				"type": "uint256",
			},
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256",
					},
					{
						"internalType": "bytes4",
						"name": "dataType",
						"type": "bytes4",
					},
					{
						"internalType": "bytes",
						"name": "data",
						"type": "bytes",
					},
				],
				"internalType": "struct AuctionHouseBase.Bid",
				"name": "bid",
				"type": "tuple",
			},
		],
		"name": "buyOut",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_auctionId",
				"type": "uint256",
			},
		],
		"name": "getCurrentBuyer",
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
				"name": "_auctionId",
				"type": "uint256",
			},
		],
		"name": "putBidWrapper",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function",
	},
]
