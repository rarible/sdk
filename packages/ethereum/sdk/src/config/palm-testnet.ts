import { toAddress } from "@rarible/types"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const palmTestnetConfig: EthereumConfig = extendConfig({
  basePath: "https://testnet-palm-api.rarible.org",
  chainId: 11297108099,
  environment: "testnet",
  exchange: {
    v2: toAddress("0x61512179F6a16bEC0D259d8010CC0485CE363868"),
    wrapper: toAddress("0xc798B273FaF23932Cf11177402C10C9b44D30Da2"),
  },
  transferProxies: {
    nft: toAddress("0x00C74eD067Cea48F1D6F7D00aBABa3C1D5B2598b"),
    erc20: toAddress("0xA094E566b61b3c2D88ACf7Cc15e3Dd0FA83F32af"),
    erc721Lazy: toAddress("0xB8863180CAC2d0Ab665e5968C0De25298A1D8CEe"),
    erc1155Lazy: toAddress("0xa2eEBb837aEF89369Ad117568d75348e6174520e"),
  },
  factories: {
    erc721: toAddress("0xe10605b2026884aCc669C2A9Cd4A5ec5f5FFf494"),
    erc1155: toAddress("0x57B3f3b79F64c475a37E6c493BAA8E6E7C5F748e"),
  },
  weth: toAddress("0xf98cabf0a963452c5536330408b2590567611a71"),
})
