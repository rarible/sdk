import type Web3 from "web3"
import type { Address } from "@rarible/ethereum-api-client"
import { DEFAULT_DATA_TYPE, replaceBigIntInContract } from "../common"

const cryptoPunksMarketBytecode = "0x6080604052600780546001600160a01b0319167385252f525456d3fce3654e56f6eaf034075e231c1790553480156200003757600080fd5b506040518060400160405280601881526020017f577261707065642043727970746f50756e6b732056312e310000000000000000815250604051806040016040528060048152602001635750563160e01b81525060006200009d6200014c60201b60201c565b600080546001600160a01b0319166001600160a01b0383169081178255604051929350917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a3508151620000fc90600190602085019062000150565b5080516200011290600290602084019062000150565b5050506040518060600160405280603681526020016200200d603691398051620001459160089160209091019062000150565b5062000233565b3390565b8280546200015e90620001f6565b90600052602060002090601f016020900481019282620001825760008555620001cd565b82601f106200019d57805160ff1916838001178555620001cd565b82800160010185558215620001cd579182015b82811115620001cd578251825591602001919060010190620001b0565b50620001db929150620001df565b5090565b5b80821115620001db5760008155600101620001e0565b600181811c908216806200020b57607f821691505b602082108114156200022d57634e487b7160e01b600052602260045260246000fd5b50919050565b611dca80620002436000396000f3fe60806040526004361061016a5760003560e01c8063715018a6116100cb578063b9aba48d1161007f578063e985e9c511610059578063e985e9c5146103d6578063ea598cb01461041f578063f2fde38b1461043257600080fd5b8063b9aba48d14610376578063c87b56dd14610396578063de0e9a3e146103b657600080fd5b806395d89b41116100b057806395d89b4114610321578063a22cb46514610336578063b88d4fde1461035657600080fd5b8063715018a6146102ee5780638da5cb5b1461030357600080fd5b806330176e13116101225780634f558e79116101075780634f558e79146102805780636352211e146102a057806370a08231146102c057600080fd5b806330176e131461024057806342842e0e1461026057600080fd5b8063081812fc11610153578063081812fc146101c6578063095ea7b3146101fe57806323b872dd1461022057600080fd5b806301ffc9a71461016f57806306fdde03146101a4575b600080fd5b34801561017b57600080fd5b5061018f61018a3660046118b2565b610452565b60405190151581526020015b60405180910390f35b3480156101b057600080fd5b506101b96104ef565b60405161019b9190611927565b3480156101d257600080fd5b506101e66101e136600461193a565b610581565b6040516001600160a01b03909116815260200161019b565b34801561020a57600080fd5b5061021e610219366004611968565b61061b565b005b34801561022c57600080fd5b5061021e61023b366004611994565b61074d565b34801561024c57600080fd5b5061021e61025b366004611a61565b6107d4565b34801561026c57600080fd5b5061021e61027b366004611994565b610845565b34801561028c57600080fd5b5061018f61029b36600461193a565b610860565b3480156102ac57600080fd5b506101e66102bb36600461193a565b61087f565b3480156102cc57600080fd5b506102e06102db366004611aaa565b61090a565b60405190815260200161019b565b3480156102fa57600080fd5b5061021e6109a4565b34801561030f57600080fd5b506000546001600160a01b03166101e6565b34801561032d57600080fd5b506101b9610a48565b34801561034257600080fd5b5061021e610351366004611ad5565b610a57565b34801561036257600080fd5b5061021e610371366004611b0e565b610b1c565b34801561038257600080fd5b506007546101e6906001600160a01b031681565b3480156103a257600080fd5b506101b96103b136600461193a565b610baa565b3480156103c257600080fd5b5061021e6103d136600461193a565b610c93565b3480156103e257600080fd5b5061018f6103f1366004611b8e565b6001600160a01b03918216600090815260066020908152604080832093909416825291909152205460ff1690565b61021e61042d36600461193a565b610d2f565b34801561043e57600080fd5b5061021e61044d366004611aaa565b610ea2565b60006001600160e01b031982167f80ac58cd0000000000000000000000000000000000000000000000000000000014806104b557506001600160e01b031982167f5b5e139f00000000000000000000000000000000000000000000000000000000145b806104e957507f01ffc9a7000000000000000000000000000000000000000000000000000000006001600160e01b03198316145b92915050565b6060600180546104fe90611bbc565b80601f016020809104026020016040519081016040528092919081815260200182805461052a90611bbc565b80156105775780601f1061054c57610100808354040283529160200191610577565b820191906000526020600020905b81548152906001019060200180831161055a57829003601f168201915b5050505050905090565b6000818152600360205260408120546001600160a01b03166105ff5760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a20617070726f76656420717565727920666f72206e6f6e657860448201526b34b9ba32b73a103a37b5b2b760a11b60648201526084015b60405180910390fd5b506000908152600560205260409020546001600160a01b031690565b60006106268261087f565b9050806001600160a01b0316836001600160a01b031614156106b05760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e6560448201527f720000000000000000000000000000000000000000000000000000000000000060648201526084016105f6565b336001600160a01b03821614806106cc57506106cc81336103f1565b61073e5760405162461bcd60e51b815260206004820152603860248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f74206f7760448201527f6e6572206e6f7220617070726f76656420666f7220616c6c000000000000000060648201526084016105f6565b6107488383610fd3565b505050565b6107573382611041565b6107c95760405162461bcd60e51b815260206004820152603160248201527f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60448201527f776e6572206e6f7220617070726f76656400000000000000000000000000000060648201526084016105f6565b610748838383611138565b6000546001600160a01b0316331461082e5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016105f6565b8051610841906008906020840190611800565b5050565b61074883838360405180602001604052806000815250610b1c565b6000818152600360205260408120546001600160a01b031615156104e9565b6000818152600360205260408120546001600160a01b0316806104e95760405162461bcd60e51b815260206004820152602960248201527f4552433732313a206f776e657220717565727920666f72206e6f6e657869737460448201527f656e7420746f6b656e000000000000000000000000000000000000000000000060648201526084016105f6565b60006001600160a01b0382166109885760405162461bcd60e51b815260206004820152602a60248201527f4552433732313a2062616c616e636520717565727920666f7220746865207a6560448201527f726f20616464726573730000000000000000000000000000000000000000000060648201526084016105f6565b506001600160a01b031660009081526004602052604090205490565b6000546001600160a01b031633146109fe5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016105f6565b600080546040516001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a3600080546001600160a01b0319169055565b6060600280546104fe90611bbc565b6001600160a01b038216331415610ab05760405162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c65720000000000000060448201526064016105f6565b3360008181526006602090815260408083206001600160a01b03871680855290835292819020805460ff191686151590811790915590519081529192917f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a35050565b610b263383611041565b610b985760405162461bcd60e51b815260206004820152603160248201527f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60448201527f776e6572206e6f7220617070726f76656400000000000000000000000000000060648201526084016105f6565b610ba484848484611305565b50505050565b6000818152600360205260409020546060906001600160a01b0316610c375760405162461bcd60e51b815260206004820152602f60248201527f4552433732314d657461646174613a2055524920717565727920666f72206e6f60448201527f6e6578697374656e7420746f6b656e000000000000000000000000000000000060648201526084016105f6565b6000610c4161138e565b90506000815111610c615760405180602001604052806000815250610c8c565b80610c6b8461139d565b604051602001610c7c929190611bf7565b6040516020818303038152906040525b9392505050565b610c9d3382611041565b610ca657600080fd5b610caf816114cf565b6007546040517f8b72a2ec000000000000000000000000000000000000000000000000000000008152336004820152602481018390526001600160a01b0390911690638b72a2ec90604401600060405180830381600087803b158015610d1457600080fd5b505af1158015610d28573d6000803e3d6000fd5b5050505050565b6007546040517f088f11f3000000000000000000000000000000000000000000000000000000008152600481018390526000918291829182916001600160a01b039091169063088f11f39060240160a060405180830381865afa158015610d9a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610dbe9190611c26565b9450945094505093508315156001151514610dd857600080fd5b6001600160a01b0383163314610ded57600080fd5b8115610df857600080fd5b6001600160a01b038116301480610e1657506001600160a01b038116155b610e1f57600080fd5b6007546040517f8264fe98000000000000000000000000000000000000000000000000000000008152600481018790526001600160a01b0390911690638264fe989034906024016000604051808303818588803b158015610e7f57600080fd5b505af1158015610e93573d6000803e3d6000fd5b5050505050610d28338661156a565b6000546001600160a01b03163314610efc5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016105f6565b6001600160a01b038116610f785760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f646472657373000000000000000000000000000000000000000000000000000060648201526084016105f6565b600080546040516001600160a01b03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b0319166001600160a01b0392909216919091179055565b600081815260056020526040902080546001600160a01b0319166001600160a01b03841690811790915581906110088261087f565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b6000818152600360205260408120546001600160a01b03166110ba5760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a206f70657261746f7220717565727920666f72206e6f6e657860448201526b34b9ba32b73a103a37b5b2b760a11b60648201526084016105f6565b60006110c58361087f565b9050806001600160a01b0316846001600160a01b031614806111005750836001600160a01b03166110f584610581565b6001600160a01b0316145b8061113057506001600160a01b0380821660009081526006602090815260408083209388168352929052205460ff165b949350505050565b826001600160a01b031661114b8261087f565b6001600160a01b0316146111c75760405162461bcd60e51b815260206004820152602960248201527f4552433732313a207472616e73666572206f6620746f6b656e2074686174206960448201527f73206e6f74206f776e000000000000000000000000000000000000000000000060648201526084016105f6565b6001600160a01b0382166112425760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f2061646460448201527f726573730000000000000000000000000000000000000000000000000000000060648201526084016105f6565b61124d600082610fd3565b6001600160a01b0383166000908152600460205260408120805460019290611276908490611c9d565b90915550506001600160a01b03821660009081526004602052604081208054600192906112a4908490611cb4565b909155505060008181526003602052604080822080546001600160a01b0319166001600160a01b0386811691821790925591518493918716917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b611310848484611138565b61131c848484846116ac565b610ba45760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e746572000000000000000000000000000060648201526084016105f6565b6060600880546104fe90611bbc565b6060816113dd57505060408051808201909152600181527f3000000000000000000000000000000000000000000000000000000000000000602082015290565b8160005b811561140757806113f181611ccc565b91506114009050600a83611cfd565b91506113e1565b60008167ffffffffffffffff811115611422576114226119d5565b6040519080825280601f01601f19166020018201604052801561144c576020820181803683370190505b5090505b841561113057611461600183611c9d565b915061146e600a86611d11565b611479906030611cb4565b60f81b81838151811061148e5761148e611d25565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053506114c8600a86611cfd565b9450611450565b60006114da8261087f565b90506114e7600083610fd3565b6001600160a01b0381166000908152600460205260408120805460019290611510908490611c9d565b909155505060008281526003602052604080822080546001600160a01b0319169055518391906001600160a01b038416907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908390a45050565b6001600160a01b0382166115c05760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f206164647265737360448201526064016105f6565b6000818152600360205260409020546001600160a01b0316156116255760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e7465640000000060448201526064016105f6565b6001600160a01b038216600090815260046020526040812080546001929061164e908490611cb4565b909155505060008181526003602052604080822080546001600160a01b0319166001600160a01b03861690811790915590518392907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b60006001600160a01b0384163b156117f557604051630a85bd0160e11b81526001600160a01b0385169063150b7a02906116f0903390899088908890600401611d3b565b6020604051808303816000875af192505050801561172b575060408051601f3d908101601f1916820190925261172891810190611d77565b60015b6117db573d808015611759576040519150601f19603f3d011682016040523d82523d6000602084013e61175e565b606091505b5080516117d35760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e746572000000000000000000000000000060648201526084016105f6565b805181602001fd5b6001600160e01b031916630a85bd0160e11b149050611130565b506001949350505050565b82805461180c90611bbc565b90600052602060002090601f01602090048101928261182e5760008555611874565b82601f1061184757805160ff1916838001178555611874565b82800160010185558215611874579182015b82811115611874578251825591602001919060010190611859565b50611880929150611884565b5090565b5b808211156118805760008155600101611885565b6001600160e01b0319811681146118af57600080fd5b50565b6000602082840312156118c457600080fd5b8135610c8c81611899565b60005b838110156118ea5781810151838201526020016118d2565b83811115610ba45750506000910152565b600081518084526119138160208601602086016118cf565b601f01601f19169290920160200192915050565b602081526000610c8c60208301846118fb565b60006020828403121561194c57600080fd5b5035919050565b6001600160a01b03811681146118af57600080fd5b6000806040838503121561197b57600080fd5b823561198681611953565b946020939093013593505050565b6000806000606084860312156119a957600080fd5b83356119b481611953565b925060208401356119c481611953565b929592945050506040919091013590565b634e487b7160e01b600052604160045260246000fd5b600067ffffffffffffffff80841115611a0657611a066119d5565b604051601f8501601f19908116603f01168101908282118183101715611a2e57611a2e6119d5565b81604052809350858152868686011115611a4757600080fd5b858560208301376000602087830101525050509392505050565b600060208284031215611a7357600080fd5b813567ffffffffffffffff811115611a8a57600080fd5b8201601f81018413611a9b57600080fd5b611130848235602084016119eb565b600060208284031215611abc57600080fd5b8135610c8c81611953565b80151581146118af57600080fd5b60008060408385031215611ae857600080fd5b8235611af381611953565b91506020830135611b0381611ac7565b809150509250929050565b60008060008060808587031215611b2457600080fd5b8435611b2f81611953565b93506020850135611b3f81611953565b925060408501359150606085013567ffffffffffffffff811115611b6257600080fd5b8501601f81018713611b7357600080fd5b611b82878235602084016119eb565b91505092959194509250565b60008060408385031215611ba157600080fd5b8235611bac81611953565b91506020830135611b0381611953565b600181811c90821680611bd057607f821691505b60208210811415611bf157634e487b7160e01b600052602260045260246000fd5b50919050565b60008351611c098184602088016118cf565b835190830190611c1d8183602088016118cf565b01949350505050565b600080600080600060a08688031215611c3e57600080fd5b8551611c4981611ac7565b602087015160408801519196509450611c6181611953565b606087015160808801519194509250611c7981611953565b809150509295509295909350565b634e487b7160e01b600052601160045260246000fd5b600082821015611caf57611caf611c87565b500390565b60008219821115611cc757611cc7611c87565b500190565b6000600019821415611ce057611ce0611c87565b5060010190565b634e487b7160e01b600052601260045260246000fd5b600082611d0c57611d0c611ce7565b500490565b600082611d2057611d20611ce7565b500690565b634e487b7160e01b600052603260045260246000fd5b60006001600160a01b03808716835280861660208401525083604083015260806060830152611d6d60808301846118fb565b9695505050505050565b600060208284031215611d8957600080fd5b8151610c8c8161189956fea2646970667358221220ed33fe75a65d013adcce2a800a840dd11f11e926eac2c5e8543e09be24a4bbb564736f6c634300080b0033697066733a2f2f516d657a376b316e3858356a68344d793234686a4171456e7635786159594b3534776148455065623346346b4c6e2f"

export async function deployCryptoPunksWrapper(web3: Web3) {
	const contract = createCryptoPunks(web3)
	const [address] = await web3.eth.getAccounts()

	const deployedContract = await contract
		.deploy({ data: cryptoPunksMarketBytecode })
		.send({ from: address, gas: "4000000" })
	return replaceBigIntInContract(deployedContract)
}

function createCryptoPunks(web3: Web3, address?: Address) {
	return new web3.eth.Contract(cryptoPunksWrapperAbi, address, DEFAULT_DATA_TYPE)
}


export const cryptoPunksWrapperAbi = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256",
			},
		],
		"name": "exists",
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
		"name": "punkAddress",
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
				"internalType": "string",
				"name": "__baseTokenURI",
				"type": "string",
			},
		],
		"name": "setBaseTokenURI",
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
				"name": "_punkId",
				"type": "uint256",
			},
		],
		"name": "unwrap",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_punkId",
				"type": "uint256",
			},
		],
		"name": "wrap",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function",
	},
] as const
