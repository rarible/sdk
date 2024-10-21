import type { Web3, Web3EthContractTypes } from "@rarible/web3-v4-ethereum"
import type { Address, EVMAddress } from "@rarible/types"
import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider"
import { NumberDataFormat } from "../../../../common/contracts"

export function createErc1155UserFactoryContract(ethereum: Ethereum, address?: Address | EVMAddress): EthereumContract {
  return ethereum.createContract(erc1155UserFactoryAbi, address)
}

export function createTestErc1155RaribleUserFactoryContract(
  web3: Web3,
  address?: Address | EVMAddress,
): Web3EthContractTypes.Contract<typeof erc1155UserFactoryAbi> {
  return new web3.eth.Contract(erc1155UserFactoryAbi, address, NumberDataFormat)
}

export async function deployTestErc1155UserRaribleFactory(web3: Web3, beacon: Address | EVMAddress) {
  const contract = createTestErc1155RaribleUserFactoryContract(web3)
  const [address] = await web3.eth.getAccounts()

  return contract
    .deploy({
      data: erc1155UserFactoryBytecode,
      arguments: [beacon],
    })
    .send({ from: address, gas: "5000000", gasPrice: "0" })
}

export const erc1155UserFactoryBytecode =
  "0x608060405234801561001057600080fd5b506040516112b83803806112b883398101604081905261002f916100ac565b60006100396100a8565b600080546001600160a01b0319166001600160a01b0383169081178255604051929350917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a350600180546001600160a01b0319166001600160a01b03929092169190911790556100da565b3390565b6000602082840312156100bd578081fd5b81516001600160a01b03811681146100d3578182fd5b9392505050565b6111cf806100e96000396000f3fe60806040523480156200001157600080fd5b50600436106200006a5760003560e01c806327050d1f146200006f57806339280695146200008857806359659e9014620000b7578063715018a614620000c15780638da5cb5b14620000cb578063f2fde38b14620000d5575b600080fd5b620000866200008036600462000672565b620000ec565b005b6200009f6200009936600462000672565b620001b9565b604051620000ae9190620007f0565b60405180910390f35b6200009f62000222565b6200008662000231565b6200009f620002f4565b62000086620000e63660046200064e565b62000303565b6000620001086200010188888888886200041e565b8362000480565b9050806001600160a01b03811663f2fde38b62000124620004af565b6040518263ffffffff1660e01b8152600401620001429190620007f0565b600060405180830381600087803b1580156200015d57600080fd5b505af115801562000172573d6000803e3d6000fd5b505050507f5b961e37212df9fe72e2c84d894099793a4569a883f97d6413c4362e68c644b582604051620001a79190620007f0565b60405180910390a15050505050505050565b600080620001d5620001cf89898989896200041e565b620004b3565b9050600060ff60f81b30858480519060200120604051602001620001fd949392919062000784565b60408051808303601f1901815291905280516020909101209998505050505050505050565b6001546001600160a01b031681565b6200023b620004af565b6001600160a01b03166200024e620002f4565b6001600160a01b031614620002aa576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b600080546040516001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a3600080546001600160a01b0319169055565b6000546001600160a01b031690565b6200030d620004af565b6001600160a01b031662000320620002f4565b6001600160a01b0316146200037c576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b6001600160a01b038116620003c35760405162461bcd60e51b8152600401808060200182810382526026815260200180620011746026913960400191505060405180910390fd5b600080546040516001600160a01b03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b0319166001600160a01b0392909216919091179055565b606063650e5ad760e01b86868686866040516024016200044395949392919062000832565b60408051601f198184030181529190526020810180516001600160e01b03166001600160e01b031990931692909217909152905095945050505050565b6000806200048e84620004b3565b9050828151602083016000f59150813b620004a857600080fd5b5092915050565b3390565b606060405180602001620004c79062000532565b601f1982820381018352601f909101166040819052600154620004fb916001600160a01b0390911690859060200162000804565b60408051601f19818403018152908290526200051b9291602001620007bd565b60405160208183030381529060405290505b919050565b610844806200093083390190565b80356001600160a01b03811681146200052d57600080fd5b600082601f83011262000569578081fd5b8135602067ffffffffffffffff8211156200058057fe5b80820262000590828201620008d7565b838152828101908684018388018501891015620005ab578687fd5b8693505b85841015620005d857620005c38162000540565b835260019390930192918401918401620005af565b50979650505050505050565b600082601f830112620005f5578081fd5b813567ffffffffffffffff8111156200060a57fe5b6200061f601f8201601f1916602001620008d7565b81815284602083860101111562000634578283fd5b816020850160208301379081016020019190915292915050565b60006020828403121562000660578081fd5b6200066b8262000540565b9392505050565b60008060008060008060c087890312156200068b578182fd5b863567ffffffffffffffff80821115620006a3578384fd5b620006b18a838b01620005e4565b97506020890135915080821115620006c7578384fd5b620006d58a838b01620005e4565b96506040890135915080821115620006eb578384fd5b620006f98a838b01620005e4565b955060608901359150808211156200070f578384fd5b6200071d8a838b01620005e4565b9450608089013591508082111562000733578384fd5b506200074289828a0162000558565b92505060a087013590509295509295509295565b6000815180845262000770816020860160208601620008fc565b601f01601f19169290920160200192915050565b6001600160f81b031994909416845260609290921b6bffffffffffffffffffffffff191660018401526015830152603582015260550190565b60008351620007d1818460208801620008fc565b835190830190620007e7818360208801620008fc565b01949350505050565b6001600160a01b0391909116815260200190565b6001600160a01b03831681526040602082018190526000906200082a9083018462000756565b949350505050565b600060a082526200084760a083018862000756565b6020838203818501526200085c828962000756565b9150838203604085015262000872828862000756565b9150838203606085015262000888828762000756565b84810360808601528551808252828701935090820190845b81811015620008c75784516001600160a01b031683529383019391830191600101620008a0565b50909a9950505050505050505050565b60405181810167ffffffffffffffff81118282101715620008f457fe5b604052919050565b60005b8381101562000919578181015183820152602001620008ff565b8381111562000929576000848401525b5050505056fe60806040526040516108443803806108448339818101604052604081101561002657600080fd5b81516020830180516040519294929383019291908464010000000082111561004d57600080fd5b90830190602082018581111561006257600080fd5b825164010000000081118282018810171561007c57600080fd5b82525081516020918201929091019080838360005b838110156100a9578181015183820152602001610091565b50505050905090810190601f1680156100d65780820380516001836020036101000a031916815260200191505b50604052506100e3915050565b6100ed82826100f4565b505061047e565b6101078261024960201b6100311760201c565b6101425760405162461bcd60e51b81526004018080602001828103825260258152602001806107c56025913960400191505060405180910390fd5b6101ba826001600160a01b0316635c60da1b6040518163ffffffff1660e01b815260040160206040518083038186803b15801561017e57600080fd5b505afa158015610192573d6000803e3d6000fd5b505050506040513d60208110156101a857600080fd5b5051610249602090811b61003117901c565b6101f55760405162461bcd60e51b81526004018080602001828103825260348152602001806108106034913960400191505060405180910390fd5b6000805160206107848339815191528281558151156102445761024261021961024f565b836040518060600160405280602181526020016107a4602191396102c260201b6100371760201c565b505b505050565b3b151590565b60006102596103c7565b6001600160a01b0316635c60da1b6040518163ffffffff1660e01b815260040160206040518083038186803b15801561029157600080fd5b505afa1580156102a5573d6000803e3d6000fd5b505050506040513d60208110156102bb57600080fd5b5051905090565b60606102cd84610249565b6103085760405162461bcd60e51b81526004018080602001828103825260268152602001806107ea6026913960400191505060405180910390fd5b600080856001600160a01b0316856040518082805190602001908083835b602083106103455780518252601f199092019160209182019101610326565b6001836020036101000a038019825116818451168082178552505050505050905001915050600060405180830381855af49150503d80600081146103a5576040519150601f19603f3d011682016040523d82523d6000602084013e6103aa565b606091505b5090925090506103bb8282866103da565b925050505b9392505050565b6000805160206107848339815191525490565b606083156103e95750816103c0565b8251156103f95782518084602001fd5b8160405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561044357818101518382015260200161042b565b50505050905090810190601f1680156104705780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b6102f78061048d6000396000f3fe60806040523661001357610011610017565b005b6100115b61001f61002f565b61002f61002a61013b565b6101ae565b565b3b151590565b606061004284610031565b61007d5760405162461bcd60e51b815260040180806020018281038252602681526020018061029c6026913960400191505060405180910390fd5b600080856001600160a01b0316856040518082805190602001908083835b602083106100ba5780518252601f19909201916020918201910161009b565b6001836020036101000a038019825116818451168082178552505050505050905001915050600060405180830381855af49150503d806000811461011a576040519150601f19603f3d011682016040523d82523d6000602084013e61011f565b606091505b509150915061012f8282866101d2565b925050505b9392505050565b6000610145610276565b6001600160a01b0316635c60da1b6040518163ffffffff1660e01b815260040160206040518083038186803b15801561017d57600080fd5b505afa158015610191573d6000803e3d6000fd5b505050506040513d60208110156101a757600080fd5b5051905090565b3660008037600080366000845af43d6000803e8080156101cd573d6000f35b3d6000fd5b606083156101e1575081610134565b8251156101f15782518084602001fd5b8160405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561023b578181015183820152602001610223565b50505050905090810190601f1680156102685780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b7fa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50549056fe416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f6e7472616374a26469706673582212208d876f4df9e95fb28cbac2f32a1bbbb4e7f39f9d7bb110fc7b5628d98879c2ba64736f6c63430007060033a3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50426561636f6e50726f78793a2066756e6374696f6e2063616c6c206661696c6564426561636f6e50726f78793a20626561636f6e206973206e6f74206120636f6e7472616374416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f6e7472616374426561636f6e50726f78793a20626561636f6e20696d706c656d656e746174696f6e206973206e6f74206120636f6e74726163744f776e61626c653a206e6577206f776e657220697320746865207a65726f2061646472657373a264697066735822122042298c7a1be957e3b4120f1e36519d0117ca30aa8564828c978f486d1be2b82c64736f6c63430007060033"
export const erc1155UserFactoryAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_beacon",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "proxy",
        type: "address",
      },
    ],
    name: "Create1155RaribleUserProxy",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "beacon",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_symbol",
        type: "string",
      },
      {
        internalType: "string",
        name: "baseURI",
        type: "string",
      },
      {
        internalType: "string",
        name: "contractURI",
        type: "string",
      },
      {
        internalType: "address[]",
        name: "operators",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "salt",
        type: "uint256",
      },
    ],
    name: "createToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_symbol",
        type: "string",
      },
      {
        internalType: "string",
        name: "baseURI",
        type: "string",
      },
      {
        internalType: "string",
        name: "contractURI",
        type: "string",
      },
      {
        internalType: "address[]",
        name: "operators",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "_salt",
        type: "uint256",
      },
    ],
    name: "getAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
] as const
