import type { EVMAddress } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider"

export function createSudoswapRouterV1Contract(ethereum: Ethereum, address?: EVMAddress): EthereumContract {
  return ethereum.createContract(SUDOSWAP_ROUTER_V1_ABI, address)
}

export const SUDOSWAP_ROUTER_V1_ABI = [
  {
    inputs: [
      {
        internalType: "contract ILSSVMPairFactoryLike",
        name: "_factory",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "factory",
    outputs: [
      {
        internalType: "contract ILSSVMPairFactoryLike",
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
        internalType: "contract ERC20",
        name: "token",
        type: "address",
      },
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
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "enum ILSSVMPairFactoryLike.PairVariant",
        name: "variant",
        type: "uint8",
      },
    ],
    name: "pairTransferERC20From",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC721",
        name: "nft",
        type: "address",
      },
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
        name: "id",
        type: "uint256",
      },
      {
        internalType: "enum ILSSVMPairFactoryLike.PairVariant",
        name: "variant",
        type: "uint8",
      },
    ],
    name: "pairTransferNFTFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "contract LSSVMPair",
                name: "pair",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "numItems",
                type: "uint256",
              },
            ],
            internalType: "struct LSSVMRouter.PairSwapAny",
            name: "swapInfo",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "maxCost",
            type: "uint256",
          },
        ],
        internalType: "struct LSSVMRouter.RobustPairSwapAny[]",
        name: "swapList",
        type: "tuple[]",
      },
      {
        internalType: "uint256",
        name: "inputAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "nftRecipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "robustSwapERC20ForAnyNFTs",
    outputs: [
      {
        internalType: "uint256",
        name: "remainingValue",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "contract LSSVMPair",
                name: "pair",
                type: "address",
              },
              {
                internalType: "uint256[]",
                name: "nftIds",
                type: "uint256[]",
              },
            ],
            internalType: "struct LSSVMRouter.PairSwapSpecific",
            name: "swapInfo",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "maxCost",
            type: "uint256",
          },
        ],
        internalType: "struct LSSVMRouter.RobustPairSwapSpecific[]",
        name: "swapList",
        type: "tuple[]",
      },
      {
        internalType: "uint256",
        name: "inputAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "nftRecipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "robustSwapERC20ForSpecificNFTs",
    outputs: [
      {
        internalType: "uint256",
        name: "remainingValue",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    internalType: "contract LSSVMPair",
                    name: "pair",
                    type: "address",
                  },
                  {
                    internalType: "uint256[]",
                    name: "nftIds",
                    type: "uint256[]",
                  },
                ],
                internalType: "struct LSSVMRouter.PairSwapSpecific",
                name: "swapInfo",
                type: "tuple",
              },
              {
                internalType: "uint256",
                name: "maxCost",
                type: "uint256",
              },
            ],
            internalType: "struct LSSVMRouter.RobustPairSwapSpecific[]",
            name: "tokenToNFTTrades",
            type: "tuple[]",
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: "contract LSSVMPair",
                    name: "pair",
                    type: "address",
                  },
                  {
                    internalType: "uint256[]",
                    name: "nftIds",
                    type: "uint256[]",
                  },
                ],
                internalType: "struct LSSVMRouter.PairSwapSpecific",
                name: "swapInfo",
                type: "tuple",
              },
              {
                internalType: "uint256",
                name: "minOutput",
                type: "uint256",
              },
            ],
            internalType: "struct LSSVMRouter.RobustPairSwapSpecificForToken[]",
            name: "nftToTokenTrades",
            type: "tuple[]",
          },
          {
            internalType: "uint256",
            name: "inputAmount",
            type: "uint256",
          },
          {
            internalType: "address payable",
            name: "tokenRecipient",
            type: "address",
          },
          {
            internalType: "address",
            name: "nftRecipient",
            type: "address",
          },
        ],
        internalType: "struct LSSVMRouter.RobustPairNFTsFoTokenAndTokenforNFTsTrade",
        name: "params",
        type: "tuple",
      },
    ],
    name: "robustSwapERC20ForSpecificNFTsAndNFTsToToken",
    outputs: [
      {
        internalType: "uint256",
        name: "remainingValue",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "outputAmount",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "contract LSSVMPair",
                name: "pair",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "numItems",
                type: "uint256",
              },
            ],
            internalType: "struct LSSVMRouter.PairSwapAny",
            name: "swapInfo",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "maxCost",
            type: "uint256",
          },
        ],
        internalType: "struct LSSVMRouter.RobustPairSwapAny[]",
        name: "swapList",
        type: "tuple[]",
      },
      {
        internalType: "address payable",
        name: "ethRecipient",
        type: "address",
      },
      {
        internalType: "address",
        name: "nftRecipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "robustSwapETHForAnyNFTs",
    outputs: [
      {
        internalType: "uint256",
        name: "remainingValue",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "contract LSSVMPair",
                name: "pair",
                type: "address",
              },
              {
                internalType: "uint256[]",
                name: "nftIds",
                type: "uint256[]",
              },
            ],
            internalType: "struct LSSVMRouter.PairSwapSpecific",
            name: "swapInfo",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "maxCost",
            type: "uint256",
          },
        ],
        internalType: "struct LSSVMRouter.RobustPairSwapSpecific[]",
        name: "swapList",
        type: "tuple[]",
      },
      {
        internalType: "address payable",
        name: "ethRecipient",
        type: "address",
      },
      {
        internalType: "address",
        name: "nftRecipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "robustSwapETHForSpecificNFTs",
    outputs: [
      {
        internalType: "uint256",
        name: "remainingValue",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    internalType: "contract LSSVMPair",
                    name: "pair",
                    type: "address",
                  },
                  {
                    internalType: "uint256[]",
                    name: "nftIds",
                    type: "uint256[]",
                  },
                ],
                internalType: "struct LSSVMRouter.PairSwapSpecific",
                name: "swapInfo",
                type: "tuple",
              },
              {
                internalType: "uint256",
                name: "maxCost",
                type: "uint256",
              },
            ],
            internalType: "struct LSSVMRouter.RobustPairSwapSpecific[]",
            name: "tokenToNFTTrades",
            type: "tuple[]",
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: "contract LSSVMPair",
                    name: "pair",
                    type: "address",
                  },
                  {
                    internalType: "uint256[]",
                    name: "nftIds",
                    type: "uint256[]",
                  },
                ],
                internalType: "struct LSSVMRouter.PairSwapSpecific",
                name: "swapInfo",
                type: "tuple",
              },
              {
                internalType: "uint256",
                name: "minOutput",
                type: "uint256",
              },
            ],
            internalType: "struct LSSVMRouter.RobustPairSwapSpecificForToken[]",
            name: "nftToTokenTrades",
            type: "tuple[]",
          },
          {
            internalType: "uint256",
            name: "inputAmount",
            type: "uint256",
          },
          {
            internalType: "address payable",
            name: "tokenRecipient",
            type: "address",
          },
          {
            internalType: "address",
            name: "nftRecipient",
            type: "address",
          },
        ],
        internalType: "struct LSSVMRouter.RobustPairNFTsFoTokenAndTokenforNFTsTrade",
        name: "params",
        type: "tuple",
      },
    ],
    name: "robustSwapETHForSpecificNFTsAndNFTsToToken",
    outputs: [
      {
        internalType: "uint256",
        name: "remainingValue",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "outputAmount",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "contract LSSVMPair",
                name: "pair",
                type: "address",
              },
              {
                internalType: "uint256[]",
                name: "nftIds",
                type: "uint256[]",
              },
            ],
            internalType: "struct LSSVMRouter.PairSwapSpecific",
            name: "swapInfo",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "minOutput",
            type: "uint256",
          },
        ],
        internalType: "struct LSSVMRouter.RobustPairSwapSpecificForToken[]",
        name: "swapList",
        type: "tuple[]",
      },
      {
        internalType: "address payable",
        name: "tokenRecipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "robustSwapNFTsForToken",
    outputs: [
      {
        internalType: "uint256",
        name: "outputAmount",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract LSSVMPair",
            name: "pair",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "numItems",
            type: "uint256",
          },
        ],
        internalType: "struct LSSVMRouter.PairSwapAny[]",
        name: "swapList",
        type: "tuple[]",
      },
      {
        internalType: "uint256",
        name: "inputAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "nftRecipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapERC20ForAnyNFTs",
    outputs: [
      {
        internalType: "uint256",
        name: "remainingValue",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract LSSVMPair",
            name: "pair",
            type: "address",
          },
          {
            internalType: "uint256[]",
            name: "nftIds",
            type: "uint256[]",
          },
        ],
        internalType: "struct LSSVMRouter.PairSwapSpecific[]",
        name: "swapList",
        type: "tuple[]",
      },
      {
        internalType: "uint256",
        name: "inputAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "nftRecipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapERC20ForSpecificNFTs",
    outputs: [
      {
        internalType: "uint256",
        name: "remainingValue",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract LSSVMPair",
            name: "pair",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "numItems",
            type: "uint256",
          },
        ],
        internalType: "struct LSSVMRouter.PairSwapAny[]",
        name: "swapList",
        type: "tuple[]",
      },
      {
        internalType: "address payable",
        name: "ethRecipient",
        type: "address",
      },
      {
        internalType: "address",
        name: "nftRecipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapETHForAnyNFTs",
    outputs: [
      {
        internalType: "uint256",
        name: "remainingValue",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract LSSVMPair",
            name: "pair",
            type: "address",
          },
          {
            internalType: "uint256[]",
            name: "nftIds",
            type: "uint256[]",
          },
        ],
        internalType: "struct LSSVMRouter.PairSwapSpecific[]",
        name: "swapList",
        type: "tuple[]",
      },
      {
        internalType: "address payable",
        name: "ethRecipient",
        type: "address",
      },
      {
        internalType: "address",
        name: "nftRecipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapETHForSpecificNFTs",
    outputs: [
      {
        internalType: "uint256",
        name: "remainingValue",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "contract LSSVMPair",
                name: "pair",
                type: "address",
              },
              {
                internalType: "uint256[]",
                name: "nftIds",
                type: "uint256[]",
              },
            ],
            internalType: "struct LSSVMRouter.PairSwapSpecific[]",
            name: "nftToTokenTrades",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "contract LSSVMPair",
                name: "pair",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "numItems",
                type: "uint256",
              },
            ],
            internalType: "struct LSSVMRouter.PairSwapAny[]",
            name: "tokenToNFTTrades",
            type: "tuple[]",
          },
        ],
        internalType: "struct LSSVMRouter.NFTsForAnyNFTsTrade",
        name: "trade",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "inputAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minOutput",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "nftRecipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapNFTsForAnyNFTsThroughERC20",
    outputs: [
      {
        internalType: "uint256",
        name: "outputAmount",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "contract LSSVMPair",
                name: "pair",
                type: "address",
              },
              {
                internalType: "uint256[]",
                name: "nftIds",
                type: "uint256[]",
              },
            ],
            internalType: "struct LSSVMRouter.PairSwapSpecific[]",
            name: "nftToTokenTrades",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "contract LSSVMPair",
                name: "pair",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "numItems",
                type: "uint256",
              },
            ],
            internalType: "struct LSSVMRouter.PairSwapAny[]",
            name: "tokenToNFTTrades",
            type: "tuple[]",
          },
        ],
        internalType: "struct LSSVMRouter.NFTsForAnyNFTsTrade",
        name: "trade",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "minOutput",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "ethRecipient",
        type: "address",
      },
      {
        internalType: "address",
        name: "nftRecipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapNFTsForAnyNFTsThroughETH",
    outputs: [
      {
        internalType: "uint256",
        name: "outputAmount",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "contract LSSVMPair",
                name: "pair",
                type: "address",
              },
              {
                internalType: "uint256[]",
                name: "nftIds",
                type: "uint256[]",
              },
            ],
            internalType: "struct LSSVMRouter.PairSwapSpecific[]",
            name: "nftToTokenTrades",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "contract LSSVMPair",
                name: "pair",
                type: "address",
              },
              {
                internalType: "uint256[]",
                name: "nftIds",
                type: "uint256[]",
              },
            ],
            internalType: "struct LSSVMRouter.PairSwapSpecific[]",
            name: "tokenToNFTTrades",
            type: "tuple[]",
          },
        ],
        internalType: "struct LSSVMRouter.NFTsForSpecificNFTsTrade",
        name: "trade",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "inputAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minOutput",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "nftRecipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapNFTsForSpecificNFTsThroughERC20",
    outputs: [
      {
        internalType: "uint256",
        name: "outputAmount",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "contract LSSVMPair",
                name: "pair",
                type: "address",
              },
              {
                internalType: "uint256[]",
                name: "nftIds",
                type: "uint256[]",
              },
            ],
            internalType: "struct LSSVMRouter.PairSwapSpecific[]",
            name: "nftToTokenTrades",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "contract LSSVMPair",
                name: "pair",
                type: "address",
              },
              {
                internalType: "uint256[]",
                name: "nftIds",
                type: "uint256[]",
              },
            ],
            internalType: "struct LSSVMRouter.PairSwapSpecific[]",
            name: "tokenToNFTTrades",
            type: "tuple[]",
          },
        ],
        internalType: "struct LSSVMRouter.NFTsForSpecificNFTsTrade",
        name: "trade",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "minOutput",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "ethRecipient",
        type: "address",
      },
      {
        internalType: "address",
        name: "nftRecipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapNFTsForSpecificNFTsThroughETH",
    outputs: [
      {
        internalType: "uint256",
        name: "outputAmount",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract LSSVMPair",
            name: "pair",
            type: "address",
          },
          {
            internalType: "uint256[]",
            name: "nftIds",
            type: "uint256[]",
          },
        ],
        internalType: "struct LSSVMRouter.PairSwapSpecific[]",
        name: "swapList",
        type: "tuple[]",
      },
      {
        internalType: "uint256",
        name: "minOutput",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "tokenRecipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapNFTsForToken",
    outputs: [
      {
        internalType: "uint256",
        name: "outputAmount",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    //@ts-ignore
    type: "receive",
  },
] as const
