import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const lightlinkConfig: EthereumConfig = {
  basePath: "https://lightlink-api.rarible.org",
  chainId: 1890,
  environment: "production",
  blockchain: Blockchain.LIGHTLINK,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x5faf16A85028BE138A7178B222DeC98092FEEF97"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0x0B7Acd053BC236fc95537e2aDD37C22968b48C1b"),
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0xF65eF65a95821A16E02973b1C2200FA58898e3c0"),
    erc20: toEVMAddress("0x248B46BEB66b3078D771a9E7E5a0a0216d0d07ba"),
    erc721Lazy: toEVMAddress("0xce4bf732f53A76C463aE8822be858017b02779c8"),
    erc1155Lazy: toEVMAddress("0x1CC22424f2B84791cb99c141A68CD2a44Cf35398"),
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
    erc721: EVM_ZERO_ADDRESS,
    erc1155: EVM_ZERO_ADDRESS,
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0x7EbeF2A4b1B09381Ec5B9dF8C5c6f2dBECA59c73"),
  auction: EVM_ZERO_ADDRESS,
  looksrareOrderValidatorV2: EVM_ZERO_ADDRESS,
}
