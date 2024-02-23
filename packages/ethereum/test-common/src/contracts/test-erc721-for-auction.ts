import type { Web3 } from "@rarible/web3-v4-ethereum"
import type { Address } from "@rarible/ethereum-api-client"
import { DEFAULT_DATA_TYPE, replaceBigIntInContract } from "../common"

const testErc721Abi = [
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
		"constant": true,
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
		"constant": true,
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
		"constant": true,
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
		"constant": true,
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
		"constant": true,
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
		"constant": true,
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
		"constant": true,
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
		"constant": true,
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256",
			},
		],
		"name": "tokenByIndex",
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
				"name": "owner",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256",
			},
		],
		"name": "tokenOfOwnerByIndex",
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
		"constant": true,
	},
	{
		"inputs": [],
		"name": "totalSupply",
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
				"name": "to",
				"type": "address",
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256",
			},
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
] as const

const testErc721Bytecode =
  "0x608060405234801561001057600080fd5b50611b03806100206000396000f3fe608060405234801561001057600080fd5b50600436106101165760003560e01c80634f6ccce7116100a257806395d89b411161007157806395d89b4114610380578063a22cb46514610388578063b88d4fde146103b6578063c87b56dd1461047c578063e985e9c51461049957610116565b80634f6ccce7146103185780636352211e146103355780636c0360eb1461035257806370a082311461035a57610116565b806318160ddd116100e957806318160ddd1461023a57806323b872dd146102545780632f745c591461028a57806340c10f19146102b657806342842e0e146102e257610116565b806301ffc9a71461011b57806306fdde0314610156578063081812fc146101d3578063095ea7b31461020c575b600080fd5b6101426004803603602081101561013157600080fd5b50356001600160e01b0319166104c7565b604080519115158252519081900360200190f35b61015e6104ea565b6040805160208082528351818301528351919283929083019185019080838360005b83811015610198578181015183820152602001610180565b50505050905090810190601f1680156101c55780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6101f0600480360360208110156101e957600080fd5b5035610580565b604080516001600160a01b039092168252519081900360200190f35b6102386004803603604081101561022257600080fd5b506001600160a01b0381351690602001356105e2565b005b6102426106bd565b60408051918252519081900360200190f35b6102386004803603606081101561026a57600080fd5b506001600160a01b038135811691602081013590911690604001356106ce565b610242600480360360408110156102a057600080fd5b506001600160a01b038135169060200135610725565b610238600480360360408110156102cc57600080fd5b506001600160a01b038135169060200135610750565b610238600480360360608110156102f857600080fd5b506001600160a01b0381358116916020810135909116906040013561075e565b6102426004803603602081101561032e57600080fd5b5035610779565b6101f06004803603602081101561034b57600080fd5b503561078f565b61015e6107b7565b6102426004803603602081101561037057600080fd5b50356001600160a01b0316610818565b61015e610880565b6102386004803603604081101561039e57600080fd5b506001600160a01b03813516906020013515156108e1565b610238600480360360808110156103cc57600080fd5b6001600160a01b0382358116926020810135909116916040820135919081019060808101606082013564010000000081111561040757600080fd5b82018360208201111561041957600080fd5b8035906020019184600183028401116401000000008311171561043b57600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295506109e6945050505050565b61015e6004803603602081101561049257600080fd5b5035610a44565b610142600480360360408110156104af57600080fd5b506001600160a01b0381358116916020013516610cc5565b6001600160e01b0319811660009081526033602052604090205460ff165b919050565b606a8054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156105765780601f1061054b57610100808354040283529160200191610576565b820191906000526020600020905b81548152906001019060200180831161055957829003601f168201915b5050505050905090565b600061058b82610cf3565b6105c65760405162461bcd60e51b815260040180806020018281038252602c8152602001806119f8602c913960400191505060405180910390fd5b506000908152606860205260409020546001600160a01b031690565b60006105ed8261078f565b9050806001600160a01b0316836001600160a01b031614156106405760405162461bcd60e51b8152600401808060200182810382526021815260200180611a7c6021913960400191505060405180910390fd5b806001600160a01b0316610652610d00565b6001600160a01b0316148061067357506106738161066e610d00565b610cc5565b6106ae5760405162461bcd60e51b815260040180806020018281038252603881526020018061194b6038913960400191505060405180910390fd5b6106b88383610d04565b505050565b60006106c96066610d72565b905090565b6106df6106d9610d00565b82610d7d565b61071a5760405162461bcd60e51b8152600401808060200182810382526031815260200180611a9d6031913960400191505060405180910390fd5b6106b8838383610e21565b6001600160a01b03821660009081526065602052604081206107479083610f6d565b90505b92915050565b61075a8282610f79565b5050565b6106b8838383604051806020016040528060008152506109e6565b6000806107876066846110a7565b509392505050565b600061074a826040518060600160405280602981526020016119ad60299139606691906110c3565b606d8054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156105765780601f1061054b57610100808354040283529160200191610576565b60006001600160a01b03821661085f5760405162461bcd60e51b815260040180806020018281038252602a815260200180611983602a913960400191505060405180910390fd5b6001600160a01b038216600090815260656020526040902061074a90610d72565b606b8054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156105765780601f1061054b57610100808354040283529160200191610576565b6108e9610d00565b6001600160a01b0316826001600160a01b0316141561094f576040805162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c657200000000000000604482015290519081900360640190fd5b806069600061095c610d00565b6001600160a01b03908116825260208083019390935260409182016000908120918716808252919093529120805460ff1916921515929092179091556109a0610d00565b6001600160a01b03167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c318360405180821515815260200191505060405180910390a35050565b6109f76109f1610d00565b83610d7d565b610a325760405162461bcd60e51b8152600401808060200182810382526031815260200180611a9d6031913960400191505060405180910390fd5b610a3e848484846110da565b50505050565b6060610a4f82610cf3565b610a8a5760405162461bcd60e51b815260040180806020018281038252602f815260200180611a4d602f913960400191505060405180910390fd5b6000828152606c602090815260408083208054825160026001831615610100026000190190921691909104601f810185900485028201850190935282815292909190830182828015610b1d5780601f10610af257610100808354040283529160200191610b1d565b820191906000526020600020905b815481529060010190602001808311610b0057829003601f168201915b505050505090506000610b2e6107b7565b9050805160001415610b42575090506104e5565b815115610c035780826040516020018083805190602001908083835b60208310610b7d5780518252601f199092019160209182019101610b5e565b51815160209384036101000a600019018019909216911617905285519190930192850191508083835b60208310610bc55780518252601f199092019160209182019101610ba6565b6001836020036101000a03801982511681845116808217855250505050505090500192505050604051602081830303815290604052925050506104e5565b80610c0d8561112c565b6040516020018083805190602001908083835b60208310610c3f5780518252601f199092019160209182019101610c20565b51815160209384036101000a600019018019909216911617905285519190930192850191508083835b60208310610c875780518252601f199092019160209182019101610c68565b6001836020036101000a0380198251168184511680821785525050505050509050019250505060405160208183030381529060405292505050919050565b6001600160a01b03918216600090815260696020908152604080832093909416825291909152205460ff1690565b600061074a606683611207565b3390565b600081815260686020526040902080546001600160a01b0319166001600160a01b0384169081179091558190610d398261078f565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b600061074a82611213565b6000610d8882610cf3565b610dc35760405162461bcd60e51b815260040180806020018281038252602c81526020018061191f602c913960400191505060405180910390fd5b6000610dce8361078f565b9050806001600160a01b0316846001600160a01b03161480610e095750836001600160a01b0316610dfe84610580565b6001600160a01b0316145b80610e195750610e198185610cc5565b949350505050565b826001600160a01b0316610e348261078f565b6001600160a01b031614610e795760405162461bcd60e51b8152600401808060200182810382526029815260200180611a246029913960400191505060405180910390fd5b6001600160a01b038216610ebe5760405162461bcd60e51b81526004018080602001828103825260248152602001806118fb6024913960400191505060405180910390fd5b610ec98383836106b8565b610ed4600082610d04565b6001600160a01b0383166000908152606560205260409020610ef69082611217565b506001600160a01b0382166000908152606560205260409020610f199082611223565b50610f266066828461122f565b5080826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a4505050565b60006107478383611245565b6001600160a01b038216610fd4576040805162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f2061646472657373604482015290519081900360640190fd5b610fdd81610cf3565b1561102f576040805162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e74656400000000604482015290519081900360640190fd5b61103b600083836106b8565b6001600160a01b038216600090815260656020526040902061105d9082611223565b5061106a6066828461122f565b5060405181906001600160a01b038416906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b60008080806110b686866112a9565b9097909650945050505050565b60006110d0848484611324565b90505b9392505050565b6110e5848484610e21565b6110f1848484846113ee565b610a3e5760405162461bcd60e51b81526004018080602001828103825260328152602001806118c96032913960400191505060405180910390fd5b60608161115157506040805180820190915260018152600360fc1b60208201526104e5565b8160005b811561116957600101600a82049150611155565b60008167ffffffffffffffff8111801561118257600080fd5b506040519080825280601f01601f1916602001820160405280156111ad576020820181803683370190505b50859350905060001982015b83156111fe57600a840660300160f81b828280600190039350815181106111dc57fe5b60200101906001600160f81b031916908160001a905350600a840493506111b9565b50949350505050565b60006107478383611556565b5490565b6000610747838361156e565b60006107478383611634565b60006110d084846001600160a01b03851661167e565b815460009082106112875760405162461bcd60e51b81526004018080602001828103825260228152602001806118a76022913960400191505060405180910390fd5b82600001828154811061129657fe5b9060005260206000200154905092915050565b8154600090819083106112ed5760405162461bcd60e51b81526004018080602001828103825260228152602001806119d66022913960400191505060405180910390fd5b60008460000184815481106112fe57fe5b906000526020600020906002020190508060000154816001015492509250509250929050565b600082815260018401602052604081205482816113bf5760405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561138457818101518382015260200161136c565b50505050905090810190601f1680156113b15780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b508460000160018203815481106113d257fe5b9060005260206000209060020201600101549150509392505050565b6000611402846001600160a01b0316611715565b61140e57506001610e19565b600061151c630a85bd0160e11b611423610d00565b88878760405160240180856001600160a01b03168152602001846001600160a01b0316815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b8381101561148a578181015183820152602001611472565b50505050905090810190601f1680156114b75780820380516001836020036101000a031916815260200191505b5095505050505050604051602081830303815290604052906001600160e01b0319166020820180516001600160e01b0383818316178352505050506040518060600160405280603281526020016118c9603291396001600160a01b038816919061171b565b9050600081806020019051602081101561153557600080fd5b50516001600160e01b031916630a85bd0160e11b1492505050949350505050565b60009081526001919091016020526040902054151590565b6000818152600183016020526040812054801561162a57835460001980830191908101906000908790839081106115a157fe5b90600052602060002001549050808760000184815481106115be57fe5b6000918252602080832090910192909255828152600189810190925260409020908401905586548790806115ee57fe5b6001900381819060005260206000200160009055905586600101600087815260200190815260200160002060009055600194505050505061074a565b600091505061074a565b60006116408383611556565b6116765750815460018181018455600084815260208082209093018490558454848252828601909352604090209190915561074a565b50600061074a565b6000828152600184016020526040812054806116e35750506040805180820182528381526020808201848152865460018181018955600089815284812095516002909302909501918255915190820155865486845281880190925292909120556110d3565b828560000160018303815481106116f657fe5b90600052602060002090600202016001018190555060009150506110d3565b3b151590565b60606110d084846000858561172f85611715565b611780576040805162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000604482015290519081900360640190fd5b600080866001600160a01b031685876040518082805190602001908083835b602083106117be5780518252601f19909201916020918201910161179f565b6001836020036101000a03801982511681845116808217855250505050505090500191505060006040518083038185875af1925050503d8060008114611820576040519150601f19603f3d011682016040523d82523d6000602084013e611825565b606091505b5091509150611835828286611840565b979650505050505050565b6060831561184f5750816110d3565b82511561185f5782518084602001fd5b60405162461bcd60e51b815260206004820181815284516024840152845185939192839260440191908501908083836000831561138457818101518382015260200161136c56fe456e756d657261626c655365743a20696e646578206f7574206f6620626f756e64734552433732313a207472616e7366657220746f206e6f6e20455243373231526563656976657220696d706c656d656e7465724552433732313a207472616e7366657220746f20746865207a65726f20616464726573734552433732313a206f70657261746f7220717565727920666f72206e6f6e6578697374656e7420746f6b656e4552433732313a20617070726f76652063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f76656420666f7220616c6c4552433732313a2062616c616e636520717565727920666f7220746865207a65726f20616464726573734552433732313a206f776e657220717565727920666f72206e6f6e6578697374656e7420746f6b656e456e756d657261626c654d61703a20696e646578206f7574206f6620626f756e64734552433732313a20617070726f76656420717565727920666f72206e6f6e6578697374656e7420746f6b656e4552433732313a207472616e73666572206f6620746f6b656e2074686174206973206e6f74206f776e4552433732314d657461646174613a2055524920717565727920666f72206e6f6e6578697374656e7420746f6b656e4552433732313a20617070726f76616c20746f2063757272656e74206f776e65724552433732313a207472616e736665722063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f766564a2646970667358221220db3409028e99b3e7d4093cbf41ee8d60e78aae65b474050ccdc60daa4732812f64736f6c63430007060033"

export async function deployTestErc721ForAuction(web3: Web3, name: string, symbol: string) {
	const empty = createTestErc721(web3)
	const [address] = await web3.eth.getAccounts()
	const contract = await empty
	// @ts-ignore
		.deploy({ data: testErc721Bytecode, arguments: [name, symbol] })
		.send({ from: address, gas: "4000000" })
	return replaceBigIntInContract(contract)
}

function createTestErc721(web3: Web3, address?: Address) {
	return new web3.eth.Contract(testErc721Abi, address, DEFAULT_DATA_TYPE)
}
