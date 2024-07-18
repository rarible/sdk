import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const palmMainnetConfig: EthereumConfig = extendConfig({
  basePath: "https://palm-api.rarible.org",
  chainId: 11297108109,
  environment: "production",
  exchange: {
    v2: toAddress("0x5faf16A85028BE138A7178B222DeC98092FEEF97"),
    wrapper: toAddress("0xF965237c6b3f89f8C62B45b94097899E3562A830"),
  },
  transferProxies: {
    nft: toAddress("0xF65eF65a95821A16E02973b1C2200FA58898e3c0"),
    erc20: toAddress("0x248B46BEB66b3078D771a9E7E5a0a0216d0d07ba"),
    erc721Lazy: toAddress("0xce4bf732f53A76C463aE8822be858017b02779c8"),
    erc1155Lazy: toAddress("0x1CC22424f2B84791cb99c141A68CD2a44Cf35398"),
  },
  factories: {
    erc721: toAddress("0xC699FB932c1bD7235C7ED19388f26A2428224AED"),
    erc1155: toAddress("0xdA12E4Ab1d731F29bF4Bff8f971579D95f8DDD07"),
  },
  weth: toAddress("0xf98cabf0a963452c5536330408b2590567611a71"),
})
