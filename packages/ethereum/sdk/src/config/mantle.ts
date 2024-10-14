import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const mantleConfig: EthereumConfig = {
  basePath: "https://mantle-api.rarible.org",
  chainId: 5000,
  environment: "production",
  blockchain: Blockchain.MANTLE,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x0e7B24d73e45B639A5cF674C5f2Bb02930716f87"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: EVM_ZERO_ADDRESS,
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0xA3AaA33E13Bd42fE5cBDefC72fB0a0888cfB44C0"),
    erc20: toEVMAddress("0x5274ac9507b20aC14e215B098479bd69733fA98A"),
    erc721Lazy: toEVMAddress("0xc0C8d44A78605E4C221C9506DA737bB2A5dfd537"),
    erc1155Lazy: toEVMAddress("0x2047f99EFa18009ceA518AC99cEE8e2151D53eDc"),
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
    erc721: toEVMAddress("0x465d62a669E98517e08e4E3D809A28FAF3DfbAE1"),
    erc1155: toEVMAddress("0x16911a36a56f828f17632cD4915614Dd5c7a45e0"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111"),
  auction: EVM_ZERO_ADDRESS,
  looksrareOrderValidatorV2: EVM_ZERO_ADDRESS,
}
