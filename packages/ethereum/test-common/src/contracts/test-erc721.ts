import type { Web3 } from "web3"
import type { EVMAddress } from "@rarible/ethereum-api-client"
import { DEFAULT_DATA_TYPE, replaceBigIntInContract } from "../common"

const testErc721Abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
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
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "baseURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
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
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
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
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
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
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "tokenByIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
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
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "uri",
        type: "string",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const

const testErc721Bytecode =
  "0x60806040523480156200001157600080fd5b5060405162002fa438038062002fa4833981810160405260408110156200003757600080fd5b81019080805160405193929190846401000000008211156200005857600080fd5b838201915060208201858111156200006f57600080fd5b82518660018202830111640100000000821117156200008d57600080fd5b8083526020830192505050908051906020019080838360005b83811015620000c3578082015181840152602081019050620000a6565b50505050905090810190601f168015620000f15780820380516001836020036101000a031916815260200191505b50604052602001805160405193929190846401000000008211156200011557600080fd5b838201915060208201858111156200012c57600080fd5b82518660018202830111640100000000821117156200014a57600080fd5b8083526020830192505050908051906020019080838360005b838110156200018057808201518184015260208101905062000163565b50505050905090810190601f168015620001ae5780820380516001836020036101000a031916815260200191505b506040525050508181620001cf6301ffc9a760e01b6200025360201b60201c565b8160069080519060200190620001e79291906200035c565b508060079080519060200190620002009291906200035c565b50620002196380ac58cd60e01b6200025360201b60201c565b62000231635b5e139f60e01b6200025360201b60201c565b6200024963780e9d6360e01b6200025360201b60201c565b5050505062000412565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161415620002f0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601c8152602001807f4552433136353a20696e76616c696420696e746572666163652069640000000081525060200191505060405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282620003945760008555620003e0565b82601f10620003af57805160ff1916838001178555620003e0565b82800160010185558215620003e0579182015b82811115620003df578251825591602001919060010190620003c2565b5b509050620003ef9190620003f3565b5090565b5b808211156200040e576000816000905550600101620003f4565b5090565b612b8280620004226000396000f3fe608060405234801561001057600080fd5b50600436106101165760003560e01c80636352211e116100a2578063a22cb46511610071578063a22cb465146105fb578063b88d4fde1461064b578063c87b56dd14610750578063d3fc9864146107f7578063e985e9c5146108dc57610116565b80636352211e146104455780636c0360eb1461049d57806370a082311461052057806395d89b411461057857610116565b806318160ddd116100e957806318160ddd146102a757806323b872dd146102c55780632f745c591461033357806342842e0e146103955780634f6ccce71461040357610116565b806301ffc9a71461011b57806306fdde031461017e578063081812fc14610201578063095ea7b314610259575b600080fd5b6101666004803603602081101561013157600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19169060200190929190505050610956565b60405180821515815260200191505060405180910390f35b6101866109bd565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156101c65780820151818401526020810190506101ab565b50505050905090810190601f1680156101f35780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61022d6004803603602081101561021757600080fd5b8101908080359060200190929190505050610a5f565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6102a56004803603604081101561026f57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610afa565b005b6102af610c3e565b6040518082815260200191505060405180910390f35b610331600480360360608110156102db57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610c4f565b005b61037f6004803603604081101561034957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610cc5565b6040518082815260200191505060405180910390f35b610401600480360360608110156103ab57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610d20565b005b61042f6004803603602081101561041957600080fd5b8101908080359060200190929190505050610d40565b6040518082815260200191505060405180910390f35b6104716004803603602081101561045b57600080fd5b8101908080359060200190929190505050610d63565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6104a5610d9a565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156104e55780820151818401526020810190506104ca565b50505050905090810190601f1680156105125780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6105626004803603602081101561053657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610e3c565b6040518082815260200191505060405180910390f35b610580610f11565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156105c05780820151818401526020810190506105a5565b50505050905090810190601f1680156105ed5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6106496004803603604081101561061157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803515159060200190929190505050610fb3565b005b61074e6004803603608081101561066157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156106c857600080fd5b8201836020820111156106da57600080fd5b803590602001918460018302840111640100000000831117156106fc57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611169565b005b61077c6004803603602081101561076657600080fd5b81019080803590602001909291905050506111e1565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156107bc5780820151818401526020810190506107a1565b50505050905090810190601f1680156107e95780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6108da6004803603606081101561080d57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019064010000000081111561085457600080fd5b82018360208201111561086657600080fd5b8035906020019184600183028401116401000000008311171561088857600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506114b2565b005b61093e600480360360408110156108f257600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506114cb565b60405180821515815260200191505060405180910390f35b6000806000837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff169050919050565b606060068054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610a555780601f10610a2a57610100808354040283529160200191610a55565b820191906000526020600020905b815481529060010190602001808311610a3857829003601f168201915b5050505050905090565b6000610a6a8261155f565b610abf576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602c815260200180612a4b602c913960400191505060405180910390fd5b6004600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b6000610b0582610d63565b90508073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610b8c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180612afb6021913960400191505060405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff16610bab61157c565b73ffffffffffffffffffffffffffffffffffffffff161480610bda5750610bd981610bd461157c565b6114cb565b5b610c2f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603881526020018061299e6038913960400191505060405180910390fd5b610c398383611584565b505050565b6000610c4a600261163d565b905090565b610c60610c5a61157c565b82611652565b610cb5576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526031815260200180612b1c6031913960400191505060405180910390fd5b610cc0838383611746565b505050565b6000610d1882600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002061198990919063ffffffff16565b905092915050565b610d3b83838360405180602001604052806000815250611169565b505050565b600080610d578360026119a390919063ffffffff16565b50905080915050919050565b6000610d9382604051806060016040528060298152602001612a006029913960026119cf9092919063ffffffff16565b9050919050565b606060098054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610e325780601f10610e0757610100808354040283529160200191610e32565b820191906000526020600020905b815481529060010190602001808311610e1557829003601f168201915b5050505050905090565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610ec3576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602a8152602001806129d6602a913960400191505060405180910390fd5b610f0a600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206119ee565b9050919050565b606060078054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610fa95780601f10610f7e57610100808354040283529160200191610fa9565b820191906000526020600020905b815481529060010190602001808311610f8c57829003601f168201915b5050505050905090565b610fbb61157c565b73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561105c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260198152602001807f4552433732313a20617070726f766520746f2063616c6c65720000000000000081525060200191505060405180910390fd5b806005600061106961157c565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff1661111661157c565b73ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c318360405180821515815260200191505060405180910390a35050565b61117a61117461157c565b83611652565b6111cf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526031815260200180612b1c6031913960400191505060405180910390fd5b6111db84848484611a03565b50505050565b60606111ec8261155f565b611241576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602f815260200180612acc602f913960400191505060405180910390fd5b6000600860008481526020019081526020016000208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156112ea5780601f106112bf576101008083540402835291602001916112ea565b820191906000526020600020905b8154815290600101906020018083116112cd57829003601f168201915b5050505050905060006112fb610d9a565b90506000815114156113115781925050506114ad565b6000825111156113e25780826040516020018083805190602001908083835b602083106113535780518252602082019150602081019050602083039250611330565b6001836020036101000a03801982511681845116808217855250505050505090500182805190602001908083835b602083106113a45780518252602082019150602081019050602083039250611381565b6001836020036101000a03801982511681845116808217855250505050505090500192505050604051602081830303815290604052925050506114ad565b806113ec85611a75565b6040516020018083805190602001908083835b6020831061142257805182526020820191506020810190506020830392506113ff565b6001836020036101000a03801982511681845116808217855250505050505090500182805190602001908083835b602083106114735780518252602082019150602081019050602083039250611450565b6001836020036101000a03801982511681845116808217855250505050505090500192505050604051602081830303815290604052925050505b919050565b6114bc8383611bbc565b6114c68282611db0565b505050565b6000600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b6000611575826002611e3a90919063ffffffff16565b9050919050565b600033905090565b816004600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff166115f783610d63565b73ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b600061164b82600001611e54565b9050919050565b600061165d8261155f565b6116b2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602c815260200180612972602c913960400191505060405180910390fd5b60006116bd83610d63565b90508073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16148061172c57508373ffffffffffffffffffffffffffffffffffffffff1661171484610a5f565b73ffffffffffffffffffffffffffffffffffffffff16145b8061173d575061173c81856114cb565b5b91505092915050565b8273ffffffffffffffffffffffffffffffffffffffff1661176682610d63565b73ffffffffffffffffffffffffffffffffffffffff16146117d2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526029815260200180612aa36029913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611858576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001806129286024913960400191505060405180910390fd5b611863838383611e65565b61186e600082611584565b6118bf81600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020611e6a90919063ffffffff16565b5061191181600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020611e8490919063ffffffff16565b5061192881836002611e9e9092919063ffffffff16565b50808273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a4505050565b60006119988360000183611ed3565b60001c905092915050565b6000806000806119b68660000186611f56565b915091508160001c8160001c9350935050509250929050565b60006119e2846000018460001b84611fef565b60001c90509392505050565b60006119fc826000016120e5565b9050919050565b611a0e848484611746565b611a1a848484846120f6565b611a6f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260328152602001806128f66032913960400191505060405180910390fd5b50505050565b60606000821415611abd576040518060400160405280600181526020017f30000000000000000000000000000000000000000000000000000000000000008152509050611bb7565b600082905060005b60008214611ae7578080600101915050600a8281611adf57fe5b049150611ac5565b60008167ffffffffffffffff81118015611b0057600080fd5b506040519080825280601f01601f191660200182016040528015611b335781602001600182028036833780820191505090505b50905060006001830390508593505b60008414611baf57600a8481611b5457fe5b0660300160f81b82828060019003935081518110611b6e57fe5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600a8481611ba757fe5b049350611b42565b819450505050505b919050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611c5f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4552433732313a206d696e7420746f20746865207a65726f206164647265737381525060200191505060405180910390fd5b611c688161155f565b15611cdb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601c8152602001807f4552433732313a20746f6b656e20616c7265616479206d696e7465640000000081525060200191505060405180910390fd5b611ce760008383611e65565b611d3881600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020611e8490919063ffffffff16565b50611d4f81836002611e9e9092919063ffffffff16565b50808273ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a45050565b611db98261155f565b611e0e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602c815260200180612a77602c913960400191505060405180910390fd5b80600860008481526020019081526020016000209080519060200190611e35929190612828565b505050565b6000611e4c836000018360001b61230f565b905092915050565b600081600001805490509050919050565b505050565b6000611e7c836000018360001b612332565b905092915050565b6000611e96836000018360001b61241a565b905092915050565b6000611eca846000018460001b8473ffffffffffffffffffffffffffffffffffffffff1660001b61248a565b90509392505050565b600081836000018054905011611f34576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806128d46022913960400191505060405180910390fd5b826000018281548110611f4357fe5b9060005260206000200154905092915050565b60008082846000018054905011611fb8576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526022815260200180612a296022913960400191505060405180910390fd5b6000846000018481548110611fc957fe5b906000526020600020906002020190508060000154816001015492509250509250929050565b600080846001016000858152602001908152602001600020549050600081141583906120b6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561207b578082015181840152602081019050612060565b50505050905090810190601f1680156120a85780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b508460000160018203815481106120c957fe5b9060005260206000209060020201600101549150509392505050565b600081600001805490509050919050565b60006121178473ffffffffffffffffffffffffffffffffffffffff16612566565b6121245760019050612307565b600061228e63150b7a0260e01b61213961157c565b888787604051602401808573ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b838110156121bd5780820151818401526020810190506121a2565b50505050905090810190601f1680156121ea5780820380516001836020036101000a031916815260200191505b5095505050505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518060600160405280603281526020016128f6603291398773ffffffffffffffffffffffffffffffffffffffff166125799092919063ffffffff16565b905060008180602001905160208110156122a757600080fd5b8101908080519060200190929190505050905063150b7a0260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614925050505b949350505050565b600080836001016000848152602001908152602001600020541415905092915050565b6000808360010160008481526020019081526020016000205490506000811461240e576000600182039050600060018660000180549050039050600086600001828154811061237d57fe5b906000526020600020015490508087600001848154811061239a57fe5b90600052602060002001819055506001830187600101600083815260200190815260200160002081905550866000018054806123d257fe5b60019003818190600052602060002001600090559055866001016000878152602001908152602001600020600090556001945050505050612414565b60009150505b92915050565b60006124268383612591565b61247f578260000182908060018154018082558091505060019003906000526020600020016000909190919091505582600001805490508360010160008481526020019081526020016000208190555060019050612484565b600090505b92915050565b60008084600101600085815260200190815260200160002054905060008114156125315784600001604051806040016040528086815260200185815250908060018154018082558091505060019003906000526020600020906002020160009091909190915060008201518160000155602082015181600101555050846000018054905085600101600086815260200190815260200160002081905550600191505061255f565b8285600001600183038154811061254457fe5b90600052602060002090600202016001018190555060009150505b9392505050565b600080823b905060008111915050919050565b606061258884846000856125b4565b90509392505050565b600080836001016000848152602001908152602001600020541415905092915050565b60608247101561260f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602681526020018061294c6026913960400191505060405180910390fd5b61261885612566565b61268a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601d8152602001807f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000081525060200191505060405180910390fd5b6000808673ffffffffffffffffffffffffffffffffffffffff1685876040518082805190602001908083835b602083106126d957805182526020820191506020810190506020830392506126b6565b6001836020036101000a03801982511681845116808217855250505050505090500191505060006040518083038185875af1925050503d806000811461273b576040519150601f19603f3d011682016040523d82523d6000602084013e612740565b606091505b509150915061275082828661275c565b92505050949350505050565b6060831561276c57829050612821565b60008351111561277f5782518084602001fd5b816040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b838110156127e65780820151818401526020810190506127cb565b50505050905090810190601f1680156128135780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b9392505050565b828054600181600116156101000203166002900490600052602060002090601f01602090048101928261285e57600085556128a5565b82601f1061287757805160ff19168380011785556128a5565b828001600101855582156128a5579182015b828111156128a4578251825591602001919060010190612889565b5b5090506128b291906128b6565b5090565b5b808211156128cf5760008160009055506001016128b7565b509056fe456e756d657261626c655365743a20696e646578206f7574206f6620626f756e64734552433732313a207472616e7366657220746f206e6f6e20455243373231526563656976657220696d706c656d656e7465724552433732313a207472616e7366657220746f20746865207a65726f2061646472657373416464726573733a20696e73756666696369656e742062616c616e636520666f722063616c6c4552433732313a206f70657261746f7220717565727920666f72206e6f6e6578697374656e7420746f6b656e4552433732313a20617070726f76652063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f76656420666f7220616c6c4552433732313a2062616c616e636520717565727920666f7220746865207a65726f20616464726573734552433732313a206f776e657220717565727920666f72206e6f6e6578697374656e7420746f6b656e456e756d657261626c654d61703a20696e646578206f7574206f6620626f756e64734552433732313a20617070726f76656420717565727920666f72206e6f6e6578697374656e7420746f6b656e4552433732314d657461646174613a2055524920736574206f66206e6f6e6578697374656e7420746f6b656e4552433732313a207472616e73666572206f6620746f6b656e2074686174206973206e6f74206f776e4552433732314d657461646174613a2055524920717565727920666f72206e6f6e6578697374656e7420746f6b656e4552433732313a20617070726f76616c20746f2063757272656e74206f776e65724552433732313a207472616e736665722063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f766564a2646970667358221220f69f6fada139805ad759555adb404c25d8e6d054c2263b2b21fae440e81bafe064736f6c63430007060033"

export async function deployTestErc721(web3: Web3, name: string, symbol: string) {
  const empty = createTestErc721(web3)
  const [address] = await web3.eth.getAccounts()
  const contract = await empty
    .deploy({ data: testErc721Bytecode, arguments: [name, symbol] })
    .send({ from: address, gas: "4000000" })
  return replaceBigIntInContract(contract)
}

export function createTestErc721(web3: Web3, address?: EVMAddress) {
  return new web3.eth.Contract(testErc721Abi, address, DEFAULT_DATA_TYPE)
}
