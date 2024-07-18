import { toAddress } from "@rarible/types"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const liskMainnetConfig: EthereumConfig = extendConfig({
  basePath: "https://lisk-api.rarible.org",
  chainId: 1135,
  environment: "production",
  exchange: {
    v2: toAddress("0x5faf16A85028BE138A7178B222DeC98092FEEF97"),
    wrapper: toAddress("0xcD6A173F1C244C3d9b9bc2434582e54B87739F08"),
  },
  transferProxies: {
    nft: toAddress("0xF65eF65a95821A16E02973b1C2200FA58898e3c0"),
    erc20: toAddress("0x248B46BEB66b3078D771a9E7E5a0a0216d0d07ba"),
    erc721Lazy: toAddress("0xce4bf732f53A76C463aE8822be858017b02779c8"),
    erc1155Lazy: toAddress("0x1CC22424f2B84791cb99c141A68CD2a44Cf35398"),
  },
  factories: {
    erc721: toAddress("0x69Be0b6f5BB5e9F8DfAA1562F06427142fb0a10a"),
    erc1155: toAddress("0xf5c9643bE5C6925F2272ecA95De16e002D6fC83C"),
  },
  weth: toAddress("0xac485391eb2d7d88253a7f1ef18c37f4242d1a24"),
})
