import { Blockchain } from "@rarible/api-client"
import { toEVMAddress } from "@rarible/types"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const abstractConfig: EthereumConfig = extendConfig({
  basePath: "https://abstract-api.rarible.org",
  chainId: 2741,
  environment: "production",
  blockchain: Blockchain.ABSTRACT,
  exchange: {
    v2: toEVMAddress("0x26fFb53E87EC52f02EE3AAFB57126cBB623C59e9"),
    wrapper: toEVMAddress("0xA4dD2acaED1C5EdAAC0dc3eC4E77A27C0a390c5B"),
  },
  transferProxies: {
    nft: toEVMAddress("0x84A2145a04b21491ef27F89E97C6B5584D86dF0f"),
    erc20: toEVMAddress("0xC66626C48cdf43B60c21eBF59ee6e180e40Db1b1"),
    erc721Lazy: toEVMAddress("0x9Cd6f06E620381954F734AbC1F4B787E81425848"),
    erc1155Lazy: toEVMAddress("0xcFCe768d793847CAbDa2Ee13dA3348CE38823b4b"),
  },
  factories: {
    erc721: toEVMAddress("0x40c99952d0a1439a86Ac5a4366b3500E24CA2f4c"),
    erc1155: toEVMAddress("0xaF2D18925bD73CFB4b956889f04fD8Bb9B631224"),
  },
  weth: toEVMAddress("0x3439153EB7AF838Ad19d56E1571FBD09333C2809"),
})
