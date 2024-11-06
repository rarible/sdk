import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const polygonConfig: EthereumConfig = {
  basePath: "https://polygon-api.rarible.org",
  chainId: 137,
  environment: "production",
  blockchain: Blockchain.POLYGON,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x12b3897a36fDB436ddE2788C06Eff0ffD997066e"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0xe90da87Ec96DF89590A5CD00c0183E69a36330a9"),
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0xd47e14DD9b98411754f722B4c4074e14752Ada7C"),
    erc20: toEVMAddress("0x49b4e47079d9b733B2227fa15f0762dBF707B263"),
    erc721Lazy: toEVMAddress("0xDD28328257a2Cce3204332C747Cc350153937A1D"),
    erc1155Lazy: toEVMAddress("0x0E63021A7597B254484b7F99dDD9b319591350B6"),
    openseaV1: EVM_ZERO_ADDRESS,
    cryptoPunks: EVM_ZERO_ADDRESS,
  },
  feeConfigUrl: FEE_CONFIG_URL,
  openSea: {
    metadata: id32("RARIBLE"),
    proxyRegistry: EVM_ZERO_ADDRESS,
  },
  factories: {
    erc721: toEVMAddress("0x16911a36a56f828f17632cD4915614Dd5c7a45e0"),
    erc1155: toEVMAddress("0xF46e8e6fA0F048DdD76F8c6982eBD059796298B8"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"),
  auction: EVM_ZERO_ADDRESS,
}
