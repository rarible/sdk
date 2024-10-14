import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const rariMainnetConfig: EthereumConfig = {
  basePath: "https://rari-api.rarible.org",
  chainId: 1380012617,
  environment: "production",
  blockchain: Blockchain.RARI,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x10CCBf49617ECB7A8262065853D6C93Ad42C3C2C"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0xd37DC0CD86Dfa9B2B57CD7DFA8B6AA0092a9517d"),
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0xce4bf732f53A76C463aE8822be858017b02779c8"),
    erc20: toEVMAddress("0x1CC22424f2B84791cb99c141A68CD2a44Cf35398"),
    erc721Lazy: toEVMAddress("0xBCE7d7fbA750B1E9e0511C67b1F38C07EbfEFE63"),
    erc1155Lazy: toEVMAddress("0x30fc6eed1d302F5f5C4a8aa58047d1a730b3Cc91"),
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
    erc721: toEVMAddress("0xdA12E4Ab1d731F29bF4Bff8f971579D95f8DDD07"),
    erc1155: toEVMAddress("0xEA26e060cCc11C840e6107cfca0B41c45Ce6a5a2"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0xf037540e51D71b2D2B1120e8432bA49F29EDFBD0"),
  auction: EVM_ZERO_ADDRESS,
  looksrareOrderValidatorV2: EVM_ZERO_ADDRESS,
}
