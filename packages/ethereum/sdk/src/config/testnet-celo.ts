import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const celoTestnetConfig: EthereumConfig = {
  basePath: "https://testnet-celo-api.rarible.org",
  environment: "testnet",
  chainId: 44787,
  blockchain: Blockchain.CELO,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0xB4D34a10921347877B0AA7A9DB347871b20b19F5"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0x7D63585bEF6FA1D49d70558FF0616C99480FFA0F"),
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0xf1dCB818F494Fb63358510b6d05Cc50096B8F06c"),
    erc20: toEVMAddress("0xB02f8F8F3527e5b2C7dB72B7eE1Af244fA8B3BAE"),
    erc721Lazy: toEVMAddress("0xE3Baf1b17335bbf3AC3C2cFCe95eC1bfC463d0c8"),
    erc1155Lazy: toEVMAddress("0x7Eabe83e0F99B6bf24Ec3F50994B972DC38D11dF"),
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
    erc721: toEVMAddress("0x48838abEAE900a2FC9fC4eC95a47F29a6c1B7647"),
    erc1155: toEVMAddress("0xC1e685AF493CcC473F22664151947CDA56Fae0A1"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: EVM_ZERO_ADDRESS,
  auction: EVM_ZERO_ADDRESS,
}
