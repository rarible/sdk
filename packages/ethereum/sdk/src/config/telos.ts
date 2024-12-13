import { toEVMAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const telosConfig: EthereumConfig = extendConfig({
  basePath: "https://telos-api.rarible.org",
  chainId: 40,
  blockchain: Blockchain.TELOS,
  environment: "production",
  exchange: {
    v2: toEVMAddress("0x5faf16A85028BE138A7178B222DeC98092FEEF97"),
    wrapper: toEVMAddress("0xF965237c6b3f89f8C62B45b94097899E3562A830"),
  },
  transferProxies: {
    nft: toEVMAddress("0xF65eF65a95821A16E02973b1C2200FA58898e3c0"),
    erc20: toEVMAddress("0x248B46BEB66b3078D771a9E7E5a0a0216d0d07ba"),
    erc721Lazy: toEVMAddress("0xce4bf732f53A76C463aE8822be858017b02779c8"),
    erc1155Lazy: toEVMAddress("0x1CC22424f2B84791cb99c141A68CD2a44Cf35398"),
  },
  factories: {
    erc721: toEVMAddress("0xC699FB932c1bD7235C7ED19388f26A2428224AED"),
    erc1155: toEVMAddress("0xdA12E4Ab1d731F29bF4Bff8f971579D95f8DDD07"),
  },
  weth: toEVMAddress("0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E"),
})
