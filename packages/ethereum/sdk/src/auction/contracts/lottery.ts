export const lotteryAbi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "lotteryId",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "token",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amountOfTickets",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "seller",
				"type": "address",
			},
		],
		"name": "LotteryCreated",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "lotteryId",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "winner",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "moneyPaid",
				"type": "uint256",
			},
		],
		"name": "LotteryFinalised",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "lotteryId",
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
				"name": "moneyPaid",
				"type": "uint256",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "ticketsLeft",
				"type": "uint256",
			},
		],
		"name": "TicketsBought",
		"type": "event",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256",
			},
		],
		"name": "lotteries",
		"outputs": [
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
				"internalType": "uint256",
				"name": "price",
				"type": "uint256",
			},
			{
				"internalType": "uint256",
				"name": "amountOfTikectsNeeded",
				"type": "uint256",
			},
			{
				"internalType": "uint256",
				"name": "amountOfTikectsBought",
				"type": "uint256",
			},
			{
				"internalType": "address",
				"name": "seller",
				"type": "address",
			},
		],
		"stateMutability": "view",
		"type": "function",
		"constant": true,
	},
	{
		"inputs": [],
		"name": "lotteryId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256",
			},
		],
		"stateMutability": "view",
		"type": "function",
		"constant": true,
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
		"inputs": [
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
				"internalType": "uint256",
				"name": "price",
				"type": "uint256",
			},
			{
				"internalType": "uint256",
				"name": "amountOfTikects",
				"type": "uint256",
			},
		],
		"name": "startLottery",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
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
				"name": "_lotteryId",
				"type": "uint256",
			},
			{
				"internalType": "uint256",
				"name": "amountOfTicketsToBuy",
				"type": "uint256",
			},
		],
		"name": "buyTikects",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function",
		"payable": true,
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_lotteryId",
				"type": "uint256",
			},
		],
		"name": "finaliseLottery",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_lotteryId",
				"type": "uint256",
			},
		],
		"name": "getBuyers",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]",
			},
		],
		"stateMutability": "view",
		"type": "function",
		"constant": true,
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_lotteryId",
				"type": "uint256",
			},
		],
		"name": "getTicketsLeft",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256",
			},
		],
		"stateMutability": "view",
		"type": "function",
		"constant": true,
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_lotteryId",
				"type": "uint256",
			},
		],
		"name": "isLotteryFinalised",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool",
			},
		],
		"stateMutability": "view",
		"type": "function",
		"constant": true,
	},
]
