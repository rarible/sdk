import type { Web3 } from "web3"
import type { EVMAddress } from "@rarible/ethereum-api-client"
import { DEFAULT_DATA_TYPE, replaceBigIntInContract } from "../../common"

export const merkleValidatorBytecode =
  "0x608060405234801561001057600080fd5b506105a7806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806396809f9014610046578063c5a0236e1461006d578063fb16a59514610080575b600080fd5b61005961005436600461040b565b610093565b604051901515815260200160405180910390f35b61005961007b3660046104a3565b61018b565b61005961008e3660046104a3565b61026e565b600083156100de576100d9868585858080602002602001604051908101604052809392919081815260200183836020028082843760009201919091525061031592505050565b6100fd565b81156100fd57604051630aa5fe8760e21b815260040160405180910390fd5b604051637921219560e11b81526001600160a01b038a811660048301528981166024830152604482018890526064820187905260a06084830152600060a483015288169063f242432a9060c401600060405180830381600087803b15801561016457600080fd5b505af1158015610178573d6000803e3d6000fd5b5060019c9b505050505050505050505050565b600083156101d6576101d1858585858080602002602001604051908101604052809392919081815260200183836020028082843760009201919091525061031592505050565b6101f5565b81156101f557604051630aa5fe8760e21b815260040160405180910390fd5b604051632142170760e11b81526001600160a01b0389811660048301528881166024830152604482018790528716906342842e0e906064015b600060405180830381600087803b15801561024857600080fd5b505af115801561025c573d6000803e3d6000fd5b5060019b9a5050505050505050505050565b600083156102b9576102b4858585858080602002602001604051908101604052809392919081815260200183836020028082843760009201919091525061031592505050565b6102d8565b81156102d857604051630aa5fe8760e21b815260040160405180910390fd5b6040516323b872dd60e01b81526001600160a01b0389811660048301528881166024830152604482018790528716906323b872dd9060640161022e565b8260005b825181101561038057600083828151811061033657610336610532565b6020026020010151905080831161035c576000838152602082905260409020925061036d565b600081815260208490526040902092505b508061037881610548565b915050610319565b508281146103a1576040516309bde33960e01b815260040160405180910390fd5b50505050565b6001600160a01b03811681146103bc57600080fd5b50565b60008083601f8401126103d157600080fd5b50813567ffffffffffffffff8111156103e957600080fd5b6020830191508360208260051b850101111561040457600080fd5b9250929050565b60008060008060008060008060e0898b03121561042757600080fd5b8835610432816103a7565b97506020890135610442816103a7565b96506040890135610452816103a7565b9550606089013594506080890135935060a0890135925060c089013567ffffffffffffffff81111561048357600080fd5b61048f8b828c016103bf565b999c989b5096995094979396929594505050565b600080600080600080600060c0888a0312156104be57600080fd5b87356104c9816103a7565b965060208801356104d9816103a7565b955060408801356104e9816103a7565b9450606088013593506080880135925060a088013567ffffffffffffffff81111561051357600080fd5b61051f8a828b016103bf565b989b979a50959850939692959293505050565b634e487b7160e01b600052603260045260246000fd5b600060001982141561056a57634e487b7160e01b600052601160045260246000fd5b506001019056fea2646970667358221220c2d181c5b58c8c41025b2ed5c8f60ef55034b98bf1d8ce9c68d8a764c6ef877064736f6c634300080b0033"
export const MERKLE_VALIDATOR_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "contract IERC721",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
      {
        internalType: "bytes32[]",
        name: "proof",
        type: "bytes32[]",
      },
    ],
    name: "matchERC721UsingCriteria",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "contract IERC721",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
      {
        internalType: "bytes32[]",
        name: "proof",
        type: "bytes32[]",
      },
    ],
    name: "matchERC721WithSafeTransferUsingCriteria",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "contract IERC1155",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
      {
        internalType: "bytes32[]",
        name: "proof",
        type: "bytes32[]",
      },
    ],
    name: "matchERC1155UsingCriteria",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const

export function createTestMerkleValidatorContract(web3: Web3, address?: EVMAddress) {
  return new web3.eth.Contract(MERKLE_VALIDATOR_ABI, address, DEFAULT_DATA_TYPE)
}
export async function deployMerkleValidator(web3: Web3) {
  const empty = createTestMerkleValidatorContract(web3)
  const [address] = await web3.eth.getAccounts()
  const contract = await empty.deploy({ data: merkleValidatorBytecode }).send({ from: address, gas: "8000000" })
  return replaceBigIntInContract(contract)
}
