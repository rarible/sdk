import { toEVMAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const hederaTestnetConfig: EthereumConfig = extendConfig({
  basePath: "https://testnet-hederaevm-api.rarible.org",
  chainId: 296,
  environment: "testnet",
  blockchain: Blockchain.HEDERAEVM,
  exchange: {
    v2: toEVMAddress("0xC4d4d5f9AcDBaA8D5a296369dA439BEE235F0dbe"),
    wrapper: toEVMAddress("0xaC66b61Dd026E02732Ae4e2a8F0776194AC20a1a"),
  },
  transferProxies: {
    nft: toEVMAddress("0x9FC45dCE54Cf761C689367a7450a82688279b818"),
    erc20: toEVMAddress("0x5Fcf855bB0ec0587a806507fe0d9D71079c04EBc"),
    erc721Lazy: toEVMAddress("0x83B58a979fF87728da4c5AB8a1A2C6F4a28Af0Fd"),
    erc1155Lazy: toEVMAddress("0x9A93478C8C9c8ecBF7db2f098AEDE82dBB0e6306"),
  },
  openSea: {
    metadata: id32("RARIBLE"),
  },
  factories: {
    erc721: toEVMAddress("0x0bb5F77F0567133BF4d22293296F9F81752CC35a"),
    erc1155: toEVMAddress("0x8936ADC061Bb292fc9b8e285BACD27054E7DE002"),
  },
  weth: toEVMAddress("0xb1F616b8134F602c3Bb465fB5b5e6565cCAd37Ed"),
})
