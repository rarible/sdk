/**
 * Required for meta contract methods abi
 */
export const MetaContractAbi = [
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
]