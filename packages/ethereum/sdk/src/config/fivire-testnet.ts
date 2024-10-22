import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const fivireTestnetConfig: EthereumConfig = extendConfig({
  basePath: "https://testnet-fivire-api.rarible.org",
  chainId: 997,
  environment: "testnet",
  blockchain: Blockchain.FIVIRE,
  exchange: {
    v2: toEVMAddress("0xB7979d08657f37C14659dbd8b45FBA91c0780780"),
    wrapper: toEVMAddress("0x98C2d878064dCD20489214cf0866f972f91784D0"),
  },
  transferProxies: {
    nft: toEVMAddress("0xF1cb795B7eA59a9213a790f868104c11a14690Fa"),
    erc20: toEVMAddress("0xa90e536A492aef0d57e6d295FA17687c3ca93347"),
    erc721Lazy: toEVMAddress("0x61512179F6a16bEC0D259d8010CC0485CE363868"),
    erc1155Lazy: toEVMAddress("0x3e52D660b69d1bDacb6C513cE085D924F5Cb9c77"),
  },
  factories: {
    erc721: toEVMAddress("0xc798B273FaF23932Cf11177402C10C9b44D30Da2"),
    erc1155: toEVMAddress("0xDa381535565B97640a6453fA7A1A7b161AF78cbE"),
  },
  weth: EVM_ZERO_ADDRESS,
})
