import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const fivireTestnetConfig: EthereumConfig = extendConfig({
  basePath: "https://testnet-fivire-api.rarible.org",
  chainId: 997,
  environment: "testnet",
  blockchain: Blockchain.FIVIRE,
  exchange: {
    v2: toAddress("0xB7979d08657f37C14659dbd8b45FBA91c0780780"),
    wrapper: toAddress("0x98C2d878064dCD20489214cf0866f972f91784D0"),
  },
  transferProxies: {
    nft: toAddress("0xF1cb795B7eA59a9213a790f868104c11a14690Fa"),
    erc20: toAddress("0xa90e536A492aef0d57e6d295FA17687c3ca93347"),
    erc721Lazy: toAddress("0x61512179F6a16bEC0D259d8010CC0485CE363868"),
    erc1155Lazy: toAddress("0x3e52D660b69d1bDacb6C513cE085D924F5Cb9c77"),
  },
  factories: {
    erc721: toAddress("0xc798B273FaF23932Cf11177402C10C9b44D30Da2"),
    erc1155: toAddress("0xDa381535565B97640a6453fA7A1A7b161AF78cbE"),
  },
  weth: ZERO_ADDRESS,
})
