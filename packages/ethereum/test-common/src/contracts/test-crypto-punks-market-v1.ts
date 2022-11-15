import type Web3 from "web3"
import type { Address } from "@rarible/ethereum-api-client"
import type { Contract } from "web3-eth-contract"
import type { AbiItem } from "../common/abi-item"

const cryptoPunksMarketBytecode = "0x60c0604090815260608190527f616333396166343739333131396565343662626666333531643863623662356660809081527f323364613630323232313236616464343236386532363131393961323932316260a05262000064916000919062000187565b5060408051808201909152600b8082527f43727970746f50756e6b730000000000000000000000000000000000000000006020909201918252620000ab9160029162000187565b50600060075560006008556000600a555b60018054600160a060020a03191633600160a060020a031617905561271060068190556008556103e860095560408051808201909152600b8082527f43525950544f50554e4b5300000000000000000000000000000000000000000060209092019182526200012e9160039162000187565b506040805180820190915260028082527fcfbe0000000000000000000000000000000000000000000000000000000000006020909201918252620001759160049162000187565b506005805460ff191690555b62000231565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10620001ca57805160ff1916838001178555620001fa565b82800160010185558215620001fa579182015b82811115620001fa578251825591602001919060010190620001dd565b5b50620002099291506200020d565b5090565b6200022e91905b8082111562000209576000815560010162000214565b5090565b90565b61107e80620002416000396000f300606060405236156101255763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166306fdde03811461012757806308573a0b146101b7578063088f11f3146101cc57806318160ddd14610218578063313ce5671461023a5780633ccfd60b1461026057806351605d801461027257806352f29a251461030257806358178168146103245780635a3b7e421461035357806370a08231146103e35780638264fe98146104115780638b72a2ec1461041e57806395d89b411461043f578063a4ddf312146104cf578063aec4e0bb146104f1578063bf31196f14610513578063c0d6ce6314610537578063c44193c314610559578063c81d1d5b14610571578063f3f4370314610586578063f6eeff1e146105b4575bfe5b341561012f57fe5b6101376105c9565b60408051602080825283518183015283519192839290830191850190808383821561017d575b80518252602083111561017d57601f19909201916020918201910161015d565b505050905090810190601f1680156101a95780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34156101bf57fe5b6101ca600435610657565b005b34156101d457fe5b6101df60043561075a565b6040805195151586526020860194909452600160a060020a03928316858501526060850191909152166080830152519081900360a00190f35b341561022057fe5b610228610798565b60408051918252519081900360200190f35b341561024257fe5b61024a61079e565b6040805160ff9092168252519081900360200190f35b341561026857fe5b6101ca6107a7565b005b341561027a57fe5b6101376107ec565b60408051602080825283518183015283519192839290830191850190808383821561017d575b80518252602083111561017d57601f19909201916020918201910161015d565b505050905090810190601f1680156101a95780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561030a57fe5b61022861087a565b60408051918252519081900360200190f35b341561032c57fe5b610337600435610880565b60408051600160a060020a039092168252519081900360200190f35b341561035b57fe5b61013761089b565b60408051602080825283518183015283519192839290830191850190808383821561017d575b80518252602083111561017d57601f19909201916020918201910161015d565b505050905090810190601f1680156101a95780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34156103eb57fe5b610228600160a060020a0360043516610926565b60408051918252519081900360200190f35b6101ca600435610938565b005b341561042657fe5b6101ca600160a060020a0360043516602435610ae2565b005b341561044757fe5b610137610bee565b60408051602080825283518183015283519192839290830191850190808383821561017d575b80518252602083111561017d57601f19909201916020918201910161015d565b505050905090810190601f1680156101a95780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34156104d757fe5b610228610c7c565b60408051918252519081900360200190f35b34156104f957fe5b610228610c82565b60408051918252519081900360200190f35b341561051b57fe5b6101ca600435602435600160a060020a0360443516610c88565b005b341561053f57fe5b610228610d8d565b60408051918252519081900360200190f35b341561056157fe5b6101ca600435602435610d93565b005b341561057957fe5b6101ca600435610e94565b005b341561058e57fe5b610228600160a060020a0360043516610f52565b60408051918252519081900360200190f35b34156105bc57fe5b6101ca600435610f64565b005b6003805460408051602060026001851615610100026000190190941693909304601f8101849004840282018401909252818152929183018282801561064f5780601f106106245761010080835404028352916020019161064f565b820191906000526020600020905b81548152906001019060200180831161063257829003601f168201915b505050505081565b60015460009033600160a060020a039081169116146106765760006000fd5b600954600a54106106875760006000fd5b5060005b600954600a5410801561069d57508181105b1561072657600780546000908152600b6020908152604091829020805473ffffffffffffffffffffffffffffffffffffffff191633600160a060020a03169081179091559254825190815291517f8a0e37b73a0d9c82e205d4d1a3ff3d0b57ce5f4d7bccf6bac03336dc101cb7ba9281900390910190a26007805460019081019091550161068b565b600880548290039055600a805482019055600160a060020a0333166000908152600c602052604090208054820190555b5050565b600d602052600090815260409020805460018201546002830154600384015460049094015460ff909316939192600160a060020a0391821692911685565b60065481565b60055460ff1681565b600160a060020a0333166000818152600e6020526040808220805490839055905190929183156108fc02918491818181858888f1935050505015156107e857fe5b5b50565b6000805460408051602060026001851615610100026000190190941693909304601f8101849004840282018401909252818152929183018282801561064f5780601f106106245761010080835404028352916020019161064f565b820191906000526020600020905b81548152906001019060200180831161063257829003601f168201915b505050505081565b60075481565b600b60205260009081526040902054600160a060020a031681565b6002805460408051602060018416156101000260001901909316849004601f8101849004840282018401909252818152929183018282801561064f5780601f106106245761010080835404028352916020019161064f565b820191906000526020600020905b81548152906001019060200180831161063257829003601f168201915b505050505081565b600c6020526000908152604090205481565b6000818152600d60205260409020805460ff1615156109575760006000fd5b6004810154600160a060020a0316158015906109845750600481015433600160a060020a03908116911614155b1561098f5760006000fd5b80600301543410156109a15760006000fd5b6000828152600b60205260409020546002820154600160a060020a039081169116146109cd5760006000fd5b6000828152600b602090815260408083208054600160a060020a0333811673ffffffffffffffffffffffffffffffffffffffff19909216821790925560028601805483168652600c855283862080546000190190558186529483902080546001908101909155945483519586529251909492909116927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef928290030190a3610a7482610f64565b600281018054600160a060020a039081166000908152600e602090815260409182902080543490810190915593548251948552915133841694929093169286927f58e5d5a525e3b40bc15abaa38b5882678db1ee68befd2f60bafe3a7fd06db9e392908290030190a45b5050565b6000818152600b602052604090205433600160a060020a03908116911614610b0a5760006000fd5b6000818152600b60209081526040808320805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0387811691821790925533909116808552600c845282852080546000190190558185529382902080546001908101909155825190815291519093927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef928290030190a381600160a060020a031633600160a060020a03167f05af636b70da6819000c49f85b21fa82081c632069bb626f30932034099107d8836040518082815260200191505060405180910390a35b5050565b6004805460408051602060026001851615610100026000190190941693909304601f8101849004840282018401909252818152929183018282801561064f5780601f106106245761010080835404028352916020019161064f565b820191906000526020600020905b81548152906001019060200180831161063257829003601f168201915b505050505081565b60095481565b600a5481565b6000838152600b602052604090205433600160a060020a03908116911614610cb05760006000fd5b6040805160a0810182526001808252602080830187815233600160a060020a03908116858701908152606086018981528883166080880181815260008d8152600d88528a90209851895460ff1916901515178955945196880196909655905160028701805473ffffffffffffffffffffffffffffffffffffffff199081169285169290921790559051600387015591516004909501805490921694169390931790925582518581529251909286927f3c7b682d5da98001a9b8cbda6c647d2c63d698a4184fd1d55e2ce7b66f5d21eb92918290030190a35b505050565b60085481565b6000828152600b602052604090205433600160a060020a03908116911614610dbb5760006000fd5b6040805160a0810182526001808252602080830186815233600160a060020a03908116858701908152606086018881526000608088018181528b8252600d87528982209851895460ff1916901515178955945196880196909655905160028701805473ffffffffffffffffffffffffffffffffffffffff199081169285169290921790559051600387015591516004909501805490921694169390931790925582518481529251909285927f3c7b682d5da98001a9b8cbda6c647d2c63d698a4184fd1d55e2ce7b66f5d21eb92918290030190a35b5050565b6008541515610ea35760006000fd5b6000818152600b6020526040902054600160a060020a031615610ec65760006000fd5b6000818152600b60209081526040808320805473ffffffffffffffffffffffffffffffffffffffff191633600160a060020a0316908117909155808452600c8352928190208054600101905560088054600019019055805184815290517f8a0e37b73a0d9c82e205d4d1a3ff3d0b57ce5f4d7bccf6bac03336dc101cb7ba929181900390910190a25b50565b600e6020526000908152604090205481565b6000818152600b602052604090205433600160a060020a03908116911614610f8c5760006000fd5b6040805160a08101825260008082526020808301858152600160a060020a033381168587019081526060860185815260808701868152898752600d9095528786209651875490151560ff19909116178755925160018701555160028601805491831673ffffffffffffffffffffffffffffffffffffffff199283161790559151600386015591516004909401805494909216931692909217909155905182917fb0e0a660b4e50f26f0b7ce75c24655fc76cc66e3334a54ff410277229fa10bd491a25b505600a165627a7a723058207ee3eab314e69a624ec65a7fd7607dd9be2e43bbd4eb52bf495e2d3b3ef80fe40029"

export async function deployCryptoPunksMarketV1(web3: Web3, address?: Address) {
	const contract = createCryptoPunks(web3, address)
	const [from] = await web3.eth.getAccounts()

	return contract
		.deploy({ data: cryptoPunksMarketBytecode })
		.send({ from, gas: 4000000, gasPrice: "0" })
}

function createCryptoPunks(web3: Web3, address?: Address): Contract {
	return new web3.eth.Contract(cryptoPunksMarketV1Abi, address)
}


export const cryptoPunksMarketV1Abi: AbiItem[] = [
	{
		"constant": true,
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"name": "",
				"type": "string",
			},
		],
		"payable": false,
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "maxForThisRun",
				"type": "uint256",
			},
		],
		"name": "reservePunksForOwner",
		"outputs": [],
		"payable": false,
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256",
			},
		],
		"name": "punksOfferedForSale",
		"outputs": [
			{
				"name": "isForSale",
				"type": "bool",
			},
			{
				"name": "punkIndex",
				"type": "uint256",
			},
			{
				"name": "seller",
				"type": "address",
			},
			{
				"name": "minValue",
				"type": "uint256",
			},
			{
				"name": "onlySellTo",
				"type": "address",
			},
		],
		"payable": false,
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"name": "",
				"type": "uint256",
			},
		],
		"payable": false,
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"name": "",
				"type": "uint8",
			},
		],
		"payable": false,
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"payable": false,
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "imageHash",
		"outputs": [
			{
				"name": "",
				"type": "string",
			},
		],
		"payable": false,
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "nextPunkIndexToAssign",
		"outputs": [
			{
				"name": "",
				"type": "uint256",
			},
		],
		"payable": false,
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256",
			},
		],
		"name": "punkIndexToAddress",
		"outputs": [
			{
				"name": "",
				"type": "address",
			},
		],
		"payable": false,
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "standard",
		"outputs": [
			{
				"name": "",
				"type": "string",
			},
		],
		"payable": false,
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address",
			},
		],
		"name": "balanceOf",
		"outputs": [
			{
				"name": "",
				"type": "uint256",
			},
		],
		"payable": false,
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "punkIndex",
				"type": "uint256",
			},
		],
		"name": "buyPunk",
		"outputs": [],
		"payable": true,
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "to",
				"type": "address",
			},
			{
				"name": "punkIndex",
				"type": "uint256",
			},
		],
		"name": "transferPunk",
		"outputs": [],
		"payable": false,
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"name": "",
				"type": "string",
			},
		],
		"payable": false,
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "numberOfPunksToReserve",
		"outputs": [
			{
				"name": "",
				"type": "uint256",
			},
		],
		"payable": false,
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "numberOfPunksReserved",
		"outputs": [
			{
				"name": "",
				"type": "uint256",
			},
		],
		"payable": false,
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "punkIndex",
				"type": "uint256",
			},
			{
				"name": "minSalePriceInWei",
				"type": "uint256",
			},
			{
				"name": "toAddress",
				"type": "address",
			},
		],
		"name": "offerPunkForSaleToAddress",
		"outputs": [],
		"payable": false,
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [],
		"name": "punksRemainingToAssign",
		"outputs": [
			{
				"name": "",
				"type": "uint256",
			},
		],
		"payable": false,
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "punkIndex",
				"type": "uint256",
			},
			{
				"name": "minSalePriceInWei",
				"type": "uint256",
			},
		],
		"name": "offerPunkForSale",
		"outputs": [],
		"payable": false,
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "punkIndex",
				"type": "uint256",
			},
		],
		"name": "getPunk",
		"outputs": [],
		"payable": false,
		"type": "function",
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address",
			},
		],
		"name": "pendingWithdrawals",
		"outputs": [
			{
				"name": "",
				"type": "uint256",
			},
		],
		"payable": false,
		"type": "function",
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "punkIndex",
				"type": "uint256",
			},
		],
		"name": "punkNoLongerForSale",
		"outputs": [],
		"payable": false,
		"type": "function",
	},
	{
		"inputs": [],
		"payable": true,
		"type": "constructor",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "to",
				"type": "address",
			},
			{
				"indexed": false,
				"name": "punkIndex",
				"type": "uint256",
			},
		],
		"name": "Assign",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "from",
				"type": "address",
			},
			{
				"indexed": true,
				"name": "to",
				"type": "address",
			},
			{
				"indexed": false,
				"name": "value",
				"type": "uint256",
			},
		],
		"name": "Transfer",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "from",
				"type": "address",
			},
			{
				"indexed": true,
				"name": "to",
				"type": "address",
			},
			{
				"indexed": false,
				"name": "punkIndex",
				"type": "uint256",
			},
		],
		"name": "PunkTransfer",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "punkIndex",
				"type": "uint256",
			},
			{
				"indexed": false,
				"name": "minValue",
				"type": "uint256",
			},
			{
				"indexed": true,
				"name": "toAddress",
				"type": "address",
			},
		],
		"name": "PunkOffered",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "punkIndex",
				"type": "uint256",
			},
			{
				"indexed": false,
				"name": "value",
				"type": "uint256",
			},
			{
				"indexed": true,
				"name": "fromAddress",
				"type": "address",
			},
			{
				"indexed": true,
				"name": "toAddress",
				"type": "address",
			},
		],
		"name": "PunkBought",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "punkIndex",
				"type": "uint256",
			},
		],
		"name": "PunkNoLongerForSale",
		"type": "event",
	},
]
