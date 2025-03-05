import { toEVMAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const hederaMainnetConfig: EthereumConfig = extendConfig({
  basePath: "https://hederaevm-api.rarible.org",
  chainId: 295,
  environment: "production",
  blockchain: Blockchain.HEDERAEVM,
  exchange: {
    v2: toEVMAddress("0x30fc6eed1d302F5f5C4a8aa58047d1a730b3Cc91"),
    wrapper: toEVMAddress("0xBFb17500344bA3475d46091F5c8f1e33B31ed909"),
  },
  transferProxies: {
    nft: toEVMAddress("0x57559104c0e4fbc578fF4251b63eA0903d7CAe32"),
    erc20: toEVMAddress("0x4217a346C8b48731641327b65bb6F6d3243d64e2"),
    erc721Lazy: toEVMAddress("0x13b05523634ABb96E6017Da71b7698CAecDf50b2"),
    erc1155Lazy: toEVMAddress("0x339e61eb644A29B134D7fD3fA589C6b3ca184111"),
  },
  openSea: {
    metadata: id32("RARIBLE"),
  },
  factories: {
    erc721: toEVMAddress("0x726f5DD8a1fFAa349bD57501Ba760AB5A03e91Ff"),
    erc1155: toEVMAddress("0xF965237c6b3f89f8C62B45b94097899E3562A830"),
  },
  weth: toEVMAddress("0x00000000000000000000000000000000002cc823"),
})
