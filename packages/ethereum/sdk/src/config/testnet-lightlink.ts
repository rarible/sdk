import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const testnetLightlinkConfig: EthereumConfig = {
  basePath: "https://testnet-lightlink-api.rarible.org",
  chainId: 1891,
  environment: "testnet",
  blockchain: Blockchain.LIGHTLINK,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x2E015B0474364757d2cc8e28897DCBCdEE07e340"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: EVM_ZERO_ADDRESS,
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0x166F6180170f438Ddc38050a2B708d38c0890956"),
    erc20: toEVMAddress("0x7d47126a2600E22eab9eD6CF0e515678727779A6"),
    erc721Lazy: toEVMAddress("0x98C2d878064dCD20489214cf0866f972f91784D0"),
    erc1155Lazy: toEVMAddress("0x12B372153249F006F756d0668fCDBD8fbD8b0a15"),
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
    erc721: toEVMAddress("0xfeC0F8d936B9cBa92a332bCB06dC7DF4DdE0c253"),
    erc1155: toEVMAddress("0x63e3297a90B4101d0a4Bb8EbEFDF3D47C8d4D4Ac"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0xF42991f02C07AB66cFEa282E7E482382aEB85461"),
  auction: EVM_ZERO_ADDRESS,
  looksrareOrderValidatorV2: EVM_ZERO_ADDRESS,
}
