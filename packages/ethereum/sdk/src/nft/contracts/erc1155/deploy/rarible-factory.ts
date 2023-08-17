import type Web3 from "web3"
import type { Address } from "@rarible/types"
import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider"

export function createErc1155FactoryContract(ethereum: Ethereum, address?: Address): EthereumContract {
	return ethereum.createContract(erc1155FactoryABI, address)
}

export function createTestErc1155RaribleFactoryContract(web3: Web3, address?: Address) {
	return new web3.eth.Contract(erc1155FactoryABI, address)
}

export async function deployTestErc1155RaribleFactory(
	web3: Web3, beacon: Address, transferProxy: Address, lazyTransferProxy: Address
) {
	const contract = createTestErc1155RaribleFactoryContract(web3)
	const [address] = await web3.eth.getAccounts()

	return contract.deploy({
		data: erc1155FactoryBytecode,
		arguments: [beacon, transferProxy, lazyTransferProxy],
	})
		.send({ from: address, gas: "5000000", gasPrice: "0" })
}

export const erc1155FactoryBytecode = "0x608060405234801561001057600080fd5b506040516112d43803806112d483398101604081905261002f916100e5565b60006100396100c5565b600080546001600160a01b0319166001600160a01b0383169081178255604051929350917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a350600180546001600160a01b039485166001600160a01b031991821617909155600280549385169382169390931790925560038054919093169116179055610127565b3390565b80516001600160a01b03811681146100e057600080fd5b919050565b6000806000606084860312156100f9578283fd5b610102846100c9565b9250610110602085016100c9565b915061011e604085016100c9565b90509250925092565b61119e806101366000396000f3fe60806040523480156200001157600080fd5b50600436106200006a5760003560e01c806359659e90146200006f578063715018a6146200009157806372397ad5146200009d5780638da5cb5b14620000b45780639cf3178b14620000be578063f2fde38b14620000d5575b600080fd5b62000079620000ec565b6040516200008891906200080e565b60405180910390f35b6200009b620000fb565b005b6200009b620000ae366004620006b7565b620001be565b620000796200035f565b62000079620000cf366004620006b7565b6200036e565b6200009b620000e636600462000687565b620003d5565b6001546001600160a01b031681565b62000105620004f0565b6001600160a01b0316620001186200035f565b6001600160a01b03161462000174576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b600080546040516001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a3600080546001600160a01b0319169055565b6000620001d9620001d287878787620004f4565b8362000553565b6002546040516318054c3760e01b815291925082916001600160a01b03808416926318054c379262000215929091169060019060040162000822565b600060405180830381600087803b1580156200023057600080fd5b505af115801562000245573d6000803e3d6000fd5b50506003546040516318054c3760e01b81526001600160a01b0380861694506318054c3793506200027e92169060019060040162000822565b600060405180830381600087803b1580156200029957600080fd5b505af1158015620002ae573d6000803e3d6000fd5b50505050806001600160a01b031663f2fde38b620002cb620004f0565b6040518263ffffffff1660e01b8152600401620002e991906200080e565b600060405180830381600087803b1580156200030457600080fd5b505af115801562000319573d6000803e3d6000fd5b505050507f7d676ffa0eb839c909c4588fca6dd0076b4036f58e821b53b7d754c0e4b9a4d0826040516200034e91906200080e565b60405180910390a150505050505050565b6000546001600160a01b031690565b600080620003896200038388888888620004f4565b62000582565b9050600060ff60f81b30858480519060200120604051602001620003b19493929190620007a2565b60408051808303601f19018152919052805160209091012098975050505050505050565b620003df620004f0565b6001600160a01b0316620003f26200035f565b6001600160a01b0316146200044e576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b6001600160a01b038116620004955760405162461bcd60e51b8152600401808060200182810382526026815260200180620011436026913960400191505060405180910390fd5b600080546040516001600160a01b03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b0319166001600160a01b0392909216919091179055565b3390565b606063148dbc4f60e01b858585856040516024016200051794939291906200086b565b60408051601f198184030181529190526020810180516001600160e01b03166001600160e01b0319909316929092179091529050949350505050565b600080620005618462000582565b9050828151602083016000f59150813b6200057b57600080fd5b5092915050565b606060405180602001620005969062000600565b601f1982820381018352601f909101166040819052600154620005ca916001600160a01b039091169085906020016200083d565b60408051601f1981840301815290829052620005ea9291602001620007db565b6040516020818303038152906040529050919050565b61084480620008ff83390190565b600082601f8301126200061f578081fd5b813567ffffffffffffffff808211156200063557fe5b604051601f8301601f1916810160200182811182821017156200065457fe5b6040528281528483016020018610156200066c578384fd5b82602086016020830137918201602001929092529392505050565b60006020828403121562000699578081fd5b81356001600160a01b0381168114620006b0578182fd5b9392505050565b600080600080600060a08688031215620006cf578081fd5b853567ffffffffffffffff80821115620006e7578283fd5b620006f589838a016200060e565b965060208801359150808211156200070b578283fd5b6200071989838a016200060e565b955060408801359150808211156200072f578283fd5b6200073d89838a016200060e565b9450606088013591508082111562000753578283fd5b5062000762888289016200060e565b95989497509295608001359392505050565b600081518084526200078e816020860160208601620008cb565b601f01601f19169290920160200192915050565b6001600160f81b031994909416845260609290921b6bffffffffffffffffffffffff191660018401526015830152603582015260550190565b60008351620007ef818460208801620008cb565b83519083019062000805818360208801620008cb565b01949350505050565b6001600160a01b0391909116815260200190565b6001600160a01b039290921682521515602082015260400190565b6001600160a01b0383168152604060208201819052600090620008639083018462000774565b949350505050565b60006080825262000880608083018762000774565b828103602084015262000894818762000774565b90508281036040840152620008aa818662000774565b90508281036060840152620008c0818562000774565b979650505050505050565b60005b83811015620008e8578181015183820152602001620008ce565b83811115620008f8576000848401525b5050505056fe60806040526040516108443803806108448339818101604052604081101561002657600080fd5b81516020830180516040519294929383019291908464010000000082111561004d57600080fd5b90830190602082018581111561006257600080fd5b825164010000000081118282018810171561007c57600080fd5b82525081516020918201929091019080838360005b838110156100a9578181015183820152602001610091565b50505050905090810190601f1680156100d65780820380516001836020036101000a031916815260200191505b50604052506100e3915050565b6100ed82826100f4565b505061047e565b6101078261024960201b6100311760201c565b6101425760405162461bcd60e51b81526004018080602001828103825260258152602001806107c56025913960400191505060405180910390fd5b6101ba826001600160a01b0316635c60da1b6040518163ffffffff1660e01b815260040160206040518083038186803b15801561017e57600080fd5b505afa158015610192573d6000803e3d6000fd5b505050506040513d60208110156101a857600080fd5b5051610249602090811b61003117901c565b6101f55760405162461bcd60e51b81526004018080602001828103825260348152602001806108106034913960400191505060405180910390fd5b6000805160206107848339815191528281558151156102445761024261021961024f565b836040518060600160405280602181526020016107a4602191396102c260201b6100371760201c565b505b505050565b3b151590565b60006102596103c7565b6001600160a01b0316635c60da1b6040518163ffffffff1660e01b815260040160206040518083038186803b15801561029157600080fd5b505afa1580156102a5573d6000803e3d6000fd5b505050506040513d60208110156102bb57600080fd5b5051905090565b60606102cd84610249565b6103085760405162461bcd60e51b81526004018080602001828103825260268152602001806107ea6026913960400191505060405180910390fd5b600080856001600160a01b0316856040518082805190602001908083835b602083106103455780518252601f199092019160209182019101610326565b6001836020036101000a038019825116818451168082178552505050505050905001915050600060405180830381855af49150503d80600081146103a5576040519150601f19603f3d011682016040523d82523d6000602084013e6103aa565b606091505b5090925090506103bb8282866103da565b925050505b9392505050565b6000805160206107848339815191525490565b606083156103e95750816103c0565b8251156103f95782518084602001fd5b8160405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561044357818101518382015260200161042b565b50505050905090810190601f1680156104705780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b6102f78061048d6000396000f3fe60806040523661001357610011610017565b005b6100115b61001f61002f565b61002f61002a61013b565b6101ae565b565b3b151590565b606061004284610031565b61007d5760405162461bcd60e51b815260040180806020018281038252602681526020018061029c6026913960400191505060405180910390fd5b600080856001600160a01b0316856040518082805190602001908083835b602083106100ba5780518252601f19909201916020918201910161009b565b6001836020036101000a038019825116818451168082178552505050505050905001915050600060405180830381855af49150503d806000811461011a576040519150601f19603f3d011682016040523d82523d6000602084013e61011f565b606091505b509150915061012f8282866101d2565b925050505b9392505050565b6000610145610276565b6001600160a01b0316635c60da1b6040518163ffffffff1660e01b815260040160206040518083038186803b15801561017d57600080fd5b505afa158015610191573d6000803e3d6000fd5b505050506040513d60208110156101a757600080fd5b5051905090565b3660008037600080366000845af43d6000803e8080156101cd573d6000f35b3d6000fd5b606083156101e1575081610134565b8251156101f15782518084602001fd5b8160405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561023b578181015183820152602001610223565b50505050905090810190601f1680156102685780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b7fa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50549056fe416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f6e7472616374a26469706673582212208d876f4df9e95fb28cbac2f32a1bbbb4e7f39f9d7bb110fc7b5628d98879c2ba64736f6c63430007060033a3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50426561636f6e50726f78793a2066756e6374696f6e2063616c6c206661696c6564426561636f6e50726f78793a20626561636f6e206973206e6f74206120636f6e7472616374416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f6e7472616374426561636f6e50726f78793a20626561636f6e20696d706c656d656e746174696f6e206973206e6f74206120636f6e74726163744f776e61626c653a206e6577206f776e657220697320746865207a65726f2061646472657373a2646970667358221220f12267365abbae1fecd57c5f27da72b3d2e0838fa8aee9181013326301bfa65e64736f6c63430007060033"
export const erc1155FactoryABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_beacon",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "_transferProxy",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "_lazyTransferProxy",
				"type": "address",
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
				"internalType": "address",
				"name": "proxy",
				"type": "address",
			},
		],
		"name": "Create1155RaribleProxy",
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
		"inputs": [],
		"name": "beacon",
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
		"constant": true,
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
				"internalType": "string",
				"name": "_name",
				"type": "string",
			},
			{
				"internalType": "string",
				"name": "_symbol",
				"type": "string",
			},
			{
				"internalType": "string",
				"name": "baseURI",
				"type": "string",
			},
			{
				"internalType": "string",
				"name": "contractURI",
				"type": "string",
			},
			{
				"internalType": "uint256",
				"name": "salt",
				"type": "uint256",
			},
		],
		"name": "createToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string",
			},
			{
				"internalType": "string",
				"name": "_symbol",
				"type": "string",
			},
			{
				"internalType": "string",
				"name": "baseURI",
				"type": "string",
			},
			{
				"internalType": "string",
				"name": "contractURI",
				"type": "string",
			},
			{
				"internalType": "uint256",
				"name": "_salt",
				"type": "uint256",
			},
		],
		"name": "getAddress",
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
] as const
