import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider"
import type { Address } from "@rarible/ethereum-api-client"
import type { AbiItem } from "../../common/abi-item"

export function createLooksrareV2Exchange(ethereum: Ethereum, address?: Address): EthereumContract {
	return ethereum.createContract(LOOKSRARE_V2_ABI, address)
}

export const LOOKSRARE_V2_ABI: AbiItem[] = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "_protocolFeeRecipient",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "_transferManager",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "_weth",
				"type": "address",
			},
		],
		"stateMutability": "nonpayable",
		"type": "constructor",
	},
	{
		"inputs": [],
		"name": "CallerInvalid",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "ChainIdInvalid",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "CreatorFeeBpTooHigh",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "CurrencyInvalid",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "ERC20TransferFromFail",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "LengthsInvalid",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "MerkleProofInvalid",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "length",
				"type": "uint256",
			},
		],
		"name": "MerkleProofTooLarge",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "NewGasLimitETHTransferTooLow",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "NewProtocolFeeRecipientCannotBeNullAddress",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "NoOngoingTransferInProgress",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "NoSelectorForStrategy",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "NoncesInvalid",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "NotAContract",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "NotAffiliateController",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "NotOwner",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "NotV2Strategy",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "NullSignerAddress",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "OutsideOfTimeRange",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "PercentageTooHigh",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "QuoteTypeInvalid",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "ReentrancyFail",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "RenouncementNotInProgress",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "SameDomainSeparator",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "SignatureEOAInvalid",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "SignatureERC1271Invalid",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "length",
				"type": "uint256",
			},
		],
		"name": "SignatureLengthInvalid",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "SignatureParameterSInvalid",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "v",
				"type": "uint8",
			},
		],
		"name": "SignatureParameterVInvalid",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "StrategyHasNoSelector",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "strategyId",
				"type": "uint256",
			},
		],
		"name": "StrategyNotAvailable",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "StrategyNotUsed",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "StrategyProtocolFeeTooHigh",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "TransferAlreadyInProgress",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "TransferNotInProgress",
		// @ts-ignore
		"type": "error",
	},
	{
		"inputs": [],
		"name": "WrongPotentialOwner",
		// @ts-ignore
		"type": "error",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "affiliate",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "currency",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "affiliateFee",
				"type": "uint256",
			},
		],
		"name": "AffiliatePayment",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "CancelOwnershipTransfer",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "currency",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isAllowed",
				"type": "bool",
			},
		],
		"name": "CurrencyStatusUpdated",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "InitiateOwnershipRenouncement",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "potentialOwner",
				"type": "address",
			},
		],
		"name": "InitiateOwnershipTransfer",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "affiliateController",
				"type": "address",
			},
		],
		"name": "NewAffiliateController",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isActive",
				"type": "bool",
			},
		],
		"name": "NewAffiliateProgramStatus",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "affiliate",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "rate",
				"type": "uint256",
			},
		],
		"name": "NewAffiliateRate",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "user",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "bidNonce",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "askNonce",
				"type": "uint256",
			},
		],
		"name": "NewBidAskNonces",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "creatorFeeManager",
				"type": "address",
			},
		],
		"name": "NewCreatorFeeManager",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "NewDomainSeparator",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "gasLimitETHTransfer",
				"type": "uint256",
			},
		],
		"name": "NewGasLimitETHTransfer",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "maxCreatorFeeBp",
				"type": "uint256",
			},
		],
		"name": "NewMaxCreatorFeeBp",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "newOwner",
				"type": "address",
			},
		],
		"name": "NewOwner",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "protocolFeeRecipient",
				"type": "address",
			},
		],
		"name": "NewProtocolFeeRecipient",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "strategyId",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "standardProtocolFeeBp",
				"type": "uint16",
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "minTotalFeeBp",
				"type": "uint16",
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "maxProtocolFeeBp",
				"type": "uint16",
			},
			{
				"indexed": false,
				"internalType": "bytes4",
				"name": "selector",
				"type": "bytes4",
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isMakerBid",
				"type": "bool",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "implementation",
				"type": "address",
			},
		],
		"name": "NewStrategy",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "user",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "orderNonces",
				"type": "uint256[]",
			},
		],
		"name": "OrderNoncesCancelled",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "strategyId",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isActive",
				"type": "bool",
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "standardProtocolFeeBp",
				"type": "uint16",
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "minTotalFeeBp",
				"type": "uint16",
			},
		],
		"name": "StrategyUpdated",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "user",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "subsetNonces",
				"type": "uint256[]",
			},
		],
		"name": "SubsetNoncesCancelled",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "orderHash",
						"type": "bytes32",
					},
					{
						"internalType": "uint256",
						"name": "orderNonce",
						"type": "uint256",
					},
					{
						"internalType": "bool",
						"name": "isNonceInvalidated",
						"type": "bool",
					},
				],
				"indexed": false,
				"internalType": "struct ILooksRareProtocol.NonceInvalidationParameters",
				"name": "nonceInvalidationParameters",
				"type": "tuple",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "askUser",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "bidUser",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "strategyId",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "currency",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "collection",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "itemIds",
				"type": "uint256[]",
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "amounts",
				"type": "uint256[]",
			},
			{
				"indexed": false,
				"internalType": "address[2]",
				"name": "feeRecipients",
				"type": "address[2]",
			},
			{
				"indexed": false,
				"internalType": "uint256[3]",
				"name": "feeAmounts",
				"type": "uint256[3]",
			},
		],
		"name": "TakerAsk",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "orderHash",
						"type": "bytes32",
					},
					{
						"internalType": "uint256",
						"name": "orderNonce",
						"type": "uint256",
					},
					{
						"internalType": "bool",
						"name": "isNonceInvalidated",
						"type": "bool",
					},
				],
				"indexed": false,
				"internalType": "struct ILooksRareProtocol.NonceInvalidationParameters",
				"name": "nonceInvalidationParameters",
				"type": "tuple",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "bidUser",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "bidRecipient",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "strategyId",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "currency",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "collection",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "itemIds",
				"type": "uint256[]",
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "amounts",
				"type": "uint256[]",
			},
			{
				"indexed": false,
				"internalType": "address[2]",
				"name": "feeRecipients",
				"type": "address[2]",
			},
			{
				"indexed": false,
				"internalType": "uint256[3]",
				"name": "feeAmounts",
				"type": "uint256[3]",
			},
		],
		"name": "TakerBid",
		"type": "event",
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
		"inputs": [],
		"name": "WETH",
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
				"internalType": "uint16",
				"name": "standardProtocolFeeBp",
				"type": "uint16",
			},
			{
				"internalType": "uint16",
				"name": "minTotalFeeBp",
				"type": "uint16",
			},
			{
				"internalType": "uint16",
				"name": "maxProtocolFeeBp",
				"type": "uint16",
			},
			{
				"internalType": "bytes4",
				"name": "selector",
				"type": "bytes4",
			},
			{
				"internalType": "bool",
				"name": "isMakerBid",
				"type": "bool",
			},
			{
				"internalType": "address",
				"name": "implementation",
				"type": "address",
			},
		],
		"name": "addStrategy",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "affiliateController",
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
		"name": "affiliateRates",
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
				"internalType": "uint256[]",
				"name": "orderNonces",
				"type": "uint256[]",
			},
		],
		"name": "cancelOrderNonces",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "cancelOwnershipTransfer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256[]",
				"name": "subsetNonces",
				"type": "uint256[]",
			},
		],
		"name": "cancelSubsetNonces",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "chainId",
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
		"name": "confirmOwnershipRenouncement",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "confirmOwnershipTransfer",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"inputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "recipient",
						"type": "address",
					},
					{
						"internalType": "bytes",
						"name": "additionalParameters",
						"type": "bytes",
					},
				],
				"internalType": "struct OrderStructs.Taker[]",
				"name": "takerBids",
				"type": "tuple[]",
			},
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
				"name": "makerAsks",
				"type": "tuple[]",
			},
			{
				"internalType": "bytes[]",
				"name": "makerSignatures",
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
			{
				"internalType": "address",
				"name": "affiliate",
				"type": "address",
			},
			{
				"internalType": "bool",
				"name": "isAtomic",
				"type": "bool",
			},
		],
		"name": "executeMultipleTakerBids",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "recipient",
						"type": "address",
					},
					{
						"internalType": "bytes",
						"name": "additionalParameters",
						"type": "bytes",
					},
				],
				"internalType": "struct OrderStructs.Taker",
				"name": "takerAsk",
				"type": "tuple",
			},
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
				"name": "makerBid",
				"type": "tuple",
			},
			{
				"internalType": "bytes",
				"name": "makerSignature",
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
			{
				"internalType": "address",
				"name": "affiliate",
				"type": "address",
			},
		],
		"name": "executeTakerAsk",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "recipient",
						"type": "address",
					},
					{
						"internalType": "bytes",
						"name": "additionalParameters",
						"type": "bytes",
					},
				],
				"internalType": "struct OrderStructs.Taker",
				"name": "takerBid",
				"type": "tuple",
			},
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
				"name": "makerAsk",
				"type": "tuple",
			},
			{
				"internalType": "bytes",
				"name": "makerSignature",
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
			{
				"internalType": "address",
				"name": "affiliate",
				"type": "address",
			},
		],
		"name": "executeTakerBid",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "root",
				"type": "bytes32",
			},
			{
				"internalType": "uint256",
				"name": "proofLength",
				"type": "uint256",
			},
		],
		"name": "hashBatchOrder",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "batchOrderHash",
				"type": "bytes32",
			},
		],
		"stateMutability": "pure",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "bool",
				"name": "bid",
				"type": "bool",
			},
			{
				"internalType": "bool",
				"name": "ask",
				"type": "bool",
			},
		],
		"name": "incrementBidAskNonces",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "initiateOwnershipRenouncement",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newPotentialOwner",
				"type": "address",
			},
		],
		"name": "initiateOwnershipTransfer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "isAffiliateProgramActive",
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
		"name": "isCurrencyAllowed",
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
		"name": "maxCreatorFeeBp",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16",
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
		"name": "ownershipStatus",
		"outputs": [
			{
				"internalType": "enum IOwnableTwoSteps.Status",
				"name": "",
				"type": "uint8",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "potentialOwner",
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
		"name": "protocolFeeRecipient",
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
				"components": [
					{
						"internalType": "address",
						"name": "recipient",
						"type": "address",
					},
					{
						"internalType": "bytes",
						"name": "additionalParameters",
						"type": "bytes",
					},
				],
				"internalType": "struct OrderStructs.Taker",
				"name": "takerBid",
				"type": "tuple",
			},
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
				"name": "makerAsk",
				"type": "tuple",
			},
			{
				"internalType": "address",
				"name": "sender",
				"type": "address",
			},
			{
				"internalType": "bytes32",
				"name": "orderHash",
				"type": "bytes32",
			},
		],
		"name": "restrictedExecuteTakerBid",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "protocolFeeAmount",
				"type": "uint256",
			},
		],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256",
			},
		],
		"name": "strategyInfo",
		"outputs": [
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool",
			},
			{
				"internalType": "uint16",
				"name": "standardProtocolFeeBp",
				"type": "uint16",
			},
			{
				"internalType": "uint16",
				"name": "minTotalFeeBp",
				"type": "uint16",
			},
			{
				"internalType": "uint16",
				"name": "maxProtocolFeeBp",
				"type": "uint16",
			},
			{
				"internalType": "bytes4",
				"name": "selector",
				"type": "bytes4",
			},
			{
				"internalType": "bool",
				"name": "isMakerBid",
				"type": "bool",
			},
			{
				"internalType": "address",
				"name": "implementation",
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
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newAffiliateController",
				"type": "address",
			},
		],
		"name": "updateAffiliateController",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool",
			},
		],
		"name": "updateAffiliateProgramStatus",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "affiliate",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "bp",
				"type": "uint256",
			},
		],
		"name": "updateAffiliateRate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newCreatorFeeManager",
				"type": "address",
			},
		],
		"name": "updateCreatorFeeManager",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "currency",
				"type": "address",
			},
			{
				"internalType": "bool",
				"name": "isAllowed",
				"type": "bool",
			},
		],
		"name": "updateCurrencyStatus",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "updateDomainSeparator",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newGasLimitETHTransfer",
				"type": "uint256",
			},
		],
		"name": "updateETHGasLimitForTransfer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "newMaxCreatorFeeBp",
				"type": "uint16",
			},
		],
		"name": "updateMaxCreatorFeeBp",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newProtocolFeeRecipient",
				"type": "address",
			},
		],
		"name": "updateProtocolFeeRecipient",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "strategyId",
				"type": "uint256",
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool",
			},
			{
				"internalType": "uint16",
				"name": "newStandardProtocolFee",
				"type": "uint16",
			},
			{
				"internalType": "uint16",
				"name": "newMinTotalFee",
				"type": "uint16",
			},
		],
		"name": "updateStrategy",
		"outputs": [],
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
		],
		"name": "userBidAskNonces",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "bidNonce",
				"type": "uint256",
			},
			{
				"internalType": "uint256",
				"name": "askNonce",
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
				"internalType": "uint256",
				"name": "",
				"type": "uint256",
			},
		],
		"name": "userOrderNonce",
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
				"internalType": "address",
				"name": "",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256",
			},
		],
		"name": "userSubsetNonce",
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
]
