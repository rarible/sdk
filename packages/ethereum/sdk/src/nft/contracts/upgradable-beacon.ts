import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider"
import type { Address } from "@rarible/ethereum-api-client"
import type Web3 from "web3"
import type { Contract } from "web3-eth-contract"
import type { AbiItem } from "../../common/abi-item"

export function createUpgradableBeaconContract(ethereum: Ethereum, address?: Address): EthereumContract {
  return ethereum.createContract(upgradableBeaconABI, address)
}

export function createTestUpgradableBeaconContract(web3: Web3, address?: Address): Contract {
  return new web3.eth.Contract(upgradableBeaconABI, address)
}

export async function deployTestUpgradableBeacon(web3: Web3, raribleMinimalAddress: Address) {
  const contract = createTestUpgradableBeaconContract(web3)
  const [address] = await web3.eth.getAccounts()

  return contract
    .deploy({
      data: upgradableBeaconBytecode,
      arguments: [raribleMinimalAddress],
    })
    .send({ from: address, gas: 5000000, gasPrice: "0" })
}

export const upgradableBeaconBytecode =
  "0x608060405234801561001057600080fd5b506040516105d53803806105d58339818101604052602081101561003357600080fd5b5051600061003f610098565b600080546001600160a01b0319166001600160a01b0383169081178255604051929350917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a3506100928161009c565b50610112565b3390565b6100af8161010c60201b6103821760201c565b6100ea5760405162461bcd60e51b81526004018080602001828103825260338152602001806105a26033913960400191505060405180910390fd5b600180546001600160a01b0319166001600160a01b0392909216919091179055565b3b151590565b610481806101216000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80633659cfe61461005c5780635c60da1b14610084578063715018a6146100a85780638da5cb5b146100b0578063f2fde38b146100b8575b600080fd5b6100826004803603602081101561007257600080fd5b50356001600160a01b03166100de565b005b61008c610192565b604080516001600160a01b039092168252519081900360200190f35b6100826101a1565b61008c61025f565b610082600480360360208110156100ce57600080fd5b50356001600160a01b031661026e565b6100e6610388565b6001600160a01b03166100f761025f565b6001600160a01b031614610152576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b61015b8161038c565b6040516001600160a01b038216907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a250565b6001546001600160a01b031690565b6101a9610388565b6001600160a01b03166101ba61025f565b6001600160a01b031614610215576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b600080546040516001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a3600080546001600160a01b0319169055565b6000546001600160a01b031690565b610276610388565b6001600160a01b031661028761025f565b6001600160a01b0316146102e2576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b6001600160a01b0381166103275760405162461bcd60e51b81526004018080602001828103825260268152602001806103f36026913960400191505060405180910390fd5b600080546040516001600160a01b03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b0319166001600160a01b0392909216919091179055565b3b151590565b3390565b61039581610382565b6103d05760405162461bcd60e51b81526004018080602001828103825260338152602001806104196033913960400191505060405180910390fd5b600180546001600160a01b0319166001600160a01b039290921691909117905556fe4f776e61626c653a206e6577206f776e657220697320746865207a65726f20616464726573735570677261646561626c65426561636f6e3a20696d706c656d656e746174696f6e206973206e6f74206120636f6e7472616374a26469706673582212203ef31d9eea40848f0a6d8746efe2c9a9ccfc7bd8060c5db4c4843fa15394efde64736f6c634300070600335570677261646561626c65426561636f6e3a20696d706c656d656e746174696f6e206973206e6f74206120636f6e7472616374"
export const upgradableBeaconABI: AbiItem[] = [
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation_",
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "Upgraded",
    type: "event",
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
    inputs: [],
    name: "implementation",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address",
      },
    ],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
]
