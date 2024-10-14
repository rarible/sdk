import type { EVMAddress } from "@rarible/types"
import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider"
import type { AbiItem } from "../../common/abi-item"

export function createSudoswapPairContract(ethereum: Ethereum, address?: EVMAddress): EthereumContract {
  return ethereum.createContract(SUDOSWAP_PAIR_ABI, address)
}

export const SUDOSWAP_PAIR_ABI: AbiItem[] = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "numNFTs",
        type: "uint256",
      },
    ],
    name: "getBuyNFTQuote",
    outputs: [
      {
        internalType: "enum CurveErrorCodes.Error",
        name: "error",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "newSpotPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "newDelta",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "inputAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "protocolFee",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]
