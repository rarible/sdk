import { toEVMAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const shapeTestnetConfig: EthereumConfig = extendConfig({
  basePath: "https://testnet-shape-api.rarible.org",
  chainId: 11011,
  environment: "testnet",
  blockchain: Blockchain.SHAPE,
  exchange: {
    v2: toEVMAddress("0x04C7d75e2C4B5Cfd86A7231A77b0584b0b04c32b"),
    wrapper: toEVMAddress("0x3289c9d376012d8F00845ee27489D611f6274B60"),
  },
  transferProxies: {
    nft: toEVMAddress("0x8A42da3cfd53ff38E6551cc3a05F536428DaaE34"),
    erc20: toEVMAddress("0x615fdFC73edB58d9ef09574B5284E6E6362F7f6D"),
    erc721Lazy: toEVMAddress("0x40785643bdD364A21aeE1d138E026e8914c98572"),
    erc1155Lazy: toEVMAddress("0xc6b97a3915b522D710315c7A177EAaecd96948B0"),
  },
  openSea: {
    metadata: id32("RARIBLE"),
  },
  factories: {
    erc721: toEVMAddress("0x3fF5Bc44c8856165c0f84c66250AF5e2550813AC"),
    erc1155: toEVMAddress("0x0622Dd7f2351e9618a22968A266d79C73cF428EB"),
  },
  weth: toEVMAddress("0x48a9b22b80f566e88f0f1dcc90ea15a8a3bae8a4"),
})
