import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const zkSyncConfig: EthereumConfig = {
  basePath: "https://zksync-api.rarible.org",
  chainId: 324,
  environment: "production",
  blockchain: Blockchain.ZKSYNC,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x5E0BbEd68e1b47C94a396226D8AC10DDe242e77c"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0xEf3b8F0B7EE374F5F79BE4D43E8cbB4A7952f274"),
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0xaf63698293A4c7d235CCf6F809C348D641C0bd62"),
    erc20: toEVMAddress("0xb5986bB35a6b53cb4764951Ad83cA12fa5a51C64"),
    erc721Lazy: toEVMAddress("0x463651f1620E411426E7eB70c3D2029106F2B6E0"),
    erc1155Lazy: toEVMAddress("0x99e3d07C2fA7d9566bAA34e84B9DD5b8fB98961a"),
    openseaV1: EVM_ZERO_ADDRESS,
    cryptoPunks: EVM_ZERO_ADDRESS,
  },
  feeConfigUrl: FEE_CONFIG_URL,
  openSea: {
    metadata: id32("RARIBLE"),
    proxyRegistry: EVM_ZERO_ADDRESS,
    merkleValidator: EVM_ZERO_ADDRESS,
  },
  factories: {
    erc721: toEVMAddress("0xB38F451e6Cc0Ad0e7a31C6Ec5648177Ba248eE9B"),
    erc1155: toEVMAddress("0x196e1D96e73c805ee39C766435A81fb235510939"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0x8Ebe4A94740515945ad826238Fc4D56c6B8b0e60"),
  auction: EVM_ZERO_ADDRESS,
  looksrareOrderValidatorV2: EVM_ZERO_ADDRESS,
}
