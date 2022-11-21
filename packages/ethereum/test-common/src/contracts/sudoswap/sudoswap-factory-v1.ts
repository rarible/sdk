import type { Address } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider"
import type { AbiItem } from "../../common/abi-item"

export function createSudoswapFactoryV1Contract(ethereum: Ethereum, address?: Address): EthereumContract {
	return ethereum.createContract(SUDOSWAP_FACTORY_V1_ABI, address)
}

export const SUDOSWAP_FACTORY_V1_ABI: AbiItem[] = [
	{
		"inputs": [
			{
				"internalType": "contract LSSVMPairEnumerableETH",
				"name": "_enumerableETHTemplate",
				"type": "address",
			},
			{
				"internalType": "contract LSSVMPairMissingEnumerableETH",
				"name": "_missingEnumerableETHTemplate",
				"type": "address",
			},
			{
				"internalType": "contract LSSVMPairEnumerableERC20",
				"name": "_enumerableERC20Template",
				"type": "address",
			},
			{
				"internalType": "contract LSSVMPairMissingEnumerableERC20",
				"name": "_missingEnumerableERC20Template",
				"type": "address",
			},
			{
				"internalType": "address payable",
				"name": "_protocolFeeRecipient",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "_protocolFeeMultiplier",
				"type": "uint256",
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
				"internalType": "contract ICurve",
				"name": "bondingCurve",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isAllowed",
				"type": "bool",
			},
		],
		"name": "BondingCurveStatusUpdate",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "target",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isAllowed",
				"type": "bool",
			},
		],
		"name": "CallTargetStatusUpdate",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "poolAddress",
				"type": "address",
			},
		],
		"name": "NFTDeposit",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "poolAddress",
				"type": "address",
			},
		],
		"name": "NewPair",
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
				"name": "newMultiplier",
				"type": "uint256",
			},
		],
		"name": "ProtocolFeeMultiplierUpdate",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "recipientAddress",
				"type": "address",
			},
		],
		"name": "ProtocolFeeRecipientUpdate",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "contract LSSVMRouter",
				"name": "router",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isAllowed",
				"type": "bool",
			},
		],
		"name": "RouterStatusUpdate",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "poolAddress",
				"type": "address",
			},
		],
		"name": "TokenDeposit",
		"type": "event",
	},
	{
		"inputs": [
			{
				"internalType": "contract ICurve",
				"name": "",
				"type": "address",
			},
		],
		"name": "bondingCurveAllowed",
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
				"name": "",
				"type": "address",
			},
		],
		"name": "callAllowed",
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
				"name": "_protocolFeeMultiplier",
				"type": "uint256",
			},
		],
		"name": "changeProtocolFeeMultiplier",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "_protocolFeeRecipient",
				"type": "address",
			},
		],
		"name": "changeProtocolFeeRecipient",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "contract ERC20",
						"name": "token",
						"type": "address",
					},
					{
						"internalType": "contract IERC721",
						"name": "nft",
						"type": "address",
					},
					{
						"internalType": "contract ICurve",
						"name": "bondingCurve",
						"type": "address",
					},
					{
						"internalType": "address payable",
						"name": "assetRecipient",
						"type": "address",
					},
					{
						"internalType": "enum LSSVMPair.PoolType",
						"name": "poolType",
						"type": "uint8",
					},
					{
						"internalType": "uint128",
						"name": "delta",
						"type": "uint128",
					},
					{
						"internalType": "uint96",
						"name": "fee",
						"type": "uint96",
					},
					{
						"internalType": "uint128",
						"name": "spotPrice",
						"type": "uint128",
					},
					{
						"internalType": "uint256[]",
						"name": "initialNFTIDs",
						"type": "uint256[]",
					},
					{
						"internalType": "uint256",
						"name": "initialTokenBalance",
						"type": "uint256",
					},
				],
				"internalType": "struct LSSVMPairFactory.CreateERC20PairParams",
				"name": "params",
				"type": "tuple",
			},
		],
		"name": "createPairERC20",
		"outputs": [
			{
				"internalType": "contract LSSVMPairERC20",
				"name": "pair",
				"type": "address",
			},
		],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "contract IERC721",
				"name": "_nft",
				"type": "address",
			},
			{
				"internalType": "contract ICurve",
				"name": "_bondingCurve",
				"type": "address",
			},
			{
				"internalType": "address payable",
				"name": "_assetRecipient",
				"type": "address",
			},
			{
				"internalType": "enum LSSVMPair.PoolType",
				"name": "_poolType",
				"type": "uint8",
			},
			{
				"internalType": "uint128",
				"name": "_delta",
				"type": "uint128",
			},
			{
				"internalType": "uint96",
				"name": "_fee",
				"type": "uint96",
			},
			{
				"internalType": "uint128",
				"name": "_spotPrice",
				"type": "uint128",
			},
			{
				"internalType": "uint256[]",
				"name": "_initialNFTIDs",
				"type": "uint256[]",
			},
		],
		"name": "createPairETH",
		"outputs": [
			{
				"internalType": "contract LSSVMPairETH",
				"name": "pair",
				"type": "address",
			},
		],
		"stateMutability": "payable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "contract ERC20",
				"name": "token",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256",
			},
		],
		"name": "depositERC20",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "contract IERC721",
				"name": "_nft",
				"type": "address",
			},
			{
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]",
			},
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address",
			},
		],
		"name": "depositNFTs",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "enumerableERC20Template",
		"outputs": [
			{
				"internalType": "contract LSSVMPairEnumerableERC20",
				"name": "",
				"type": "address",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "enumerableETHTemplate",
		"outputs": [
			{
				"internalType": "contract LSSVMPairEnumerableETH",
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
				"name": "potentialPair",
				"type": "address",
			},
			{
				"internalType": "enum ILSSVMPairFactoryLike.PairVariant",
				"name": "variant",
				"type": "uint8",
			},
		],
		"name": "isPair",
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
		"name": "missingEnumerableERC20Template",
		"outputs": [
			{
				"internalType": "contract LSSVMPairMissingEnumerableERC20",
				"name": "",
				"type": "address",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "missingEnumerableETHTemplate",
		"outputs": [
			{
				"internalType": "contract LSSVMPairMissingEnumerableETH",
				"name": "",
				"type": "address",
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
		"name": "protocolFeeMultiplier",
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
		"name": "protocolFeeRecipient",
		"outputs": [
			{
				"internalType": "address payable",
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
				"internalType": "contract LSSVMRouter",
				"name": "",
				"type": "address",
			},
		],
		"name": "routerStatus",
		"outputs": [
			{
				"internalType": "bool",
				"name": "allowed",
				"type": "bool",
			},
			{
				"internalType": "bool",
				"name": "wasEverAllowed",
				"type": "bool",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "contract ICurve",
				"name": "bondingCurve",
				"type": "address",
			},
			{
				"internalType": "bool",
				"name": "isAllowed",
				"type": "bool",
			},
		],
		"name": "setBondingCurveAllowed",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "target",
				"type": "address",
			},
			{
				"internalType": "bool",
				"name": "isAllowed",
				"type": "bool",
			},
		],
		"name": "setCallAllowed",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "contract LSSVMRouter",
				"name": "_router",
				"type": "address",
			},
			{
				"internalType": "bool",
				"name": "isAllowed",
				"type": "bool",
			},
		],
		"name": "setRouterAllowed",
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
				"internalType": "contract ERC20",
				"name": "token",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256",
			},
		],
		"name": "withdrawERC20ProtocolFees",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "withdrawETHProtocolFees",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"stateMutability": "payable",
		//@ts-ignore
		"type": "receive",
	},
]
