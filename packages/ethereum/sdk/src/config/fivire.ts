import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const fivireConfig: EthereumConfig = extendConfig({
  basePath: "https://fivire-api.rarible.org",
  chainId: 995,
  environment: "production",
  blockchain: Blockchain.FIVIRE,
  exchange: {
    v2: toEVMAddress("0x9b761A2C45daEd76Dfbcfd52d22cB930a0b41186"),
    wrapper: toEVMAddress("0x55A921a57f7F15dF2f229Ab9889506Ca89310800"),
  },
  transferProxies: {
    nft: toEVMAddress("0x57559104c0e4fbc578fF4251b63eA0903d7CAe32"),
    erc20: toEVMAddress("0x4217a346C8b48731641327b65bb6F6d3243d64e2"),
    erc721Lazy: toEVMAddress("0x1CC22424f2B84791cb99c141A68CD2a44Cf35398"),
    erc1155Lazy: toEVMAddress("0xBCE7d7fbA750B1E9e0511C67b1F38C07EbfEFE63"),
  },
  factories: {
    erc721: toEVMAddress("0xD9F3BfeD52ec008A13cF08C7382a917Eb364Cc32"),
    erc1155: toEVMAddress("0xBFb17500344bA3475d46091F5c8f1e33B31ed909"),
  },
  weth: EVM_ZERO_ADDRESS,
})
